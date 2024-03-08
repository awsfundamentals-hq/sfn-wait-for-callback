import * as sfn from "aws-cdk-lib/aws-stepfunctions";
import * as tasks from "aws-cdk-lib/aws-stepfunctions-tasks";
import { Function, StackContext, use } from "sst/constructs";
import { RequestTable } from "./Table";
import { Api } from "./Api";

export function StepFunction({ stack }: StackContext) {
  const { requestsTable } = use(RequestTable);
  const { apiLambda } = use(Api);

  // Lambda Function that receives the callback from the manual approval
  const approvalReceiverLambda = new Function(stack, "ApprovalReceiverLambda", {
    handler: "packages/functions/src/approval-receiver.handler",
    url: true,
  });

  // Lambda function to notify admin -- stack is actual just a mock to wait for the callback
  const notifyLambda = new Function(stack, "NotifyLambda", {
    handler: "packages/functions/src/ask-approval.handler",
    bind: [requestsTable, approvalReceiverLambda],
  });

  // Step Function
  const manualApprovalLambdaTask = new tasks.LambdaInvoke(
    stack,
    "Ask For Manual Approval",
    {
      lambdaFunction: notifyLambda,
      integrationPattern: sfn.IntegrationPattern.WAIT_FOR_TASK_TOKEN,
      payload: sfn.TaskInput.fromObject({
        taskToken: sfn.JsonPath.taskToken,
        input: sfn.JsonPath.entirePayload,
        executionArn: sfn.JsonPath.stringAt("$$.Execution.Id"),
        stateMachineArn: sfn.JsonPath.stringAt("$$.StateMachine.Id"),
      }),
    }
  );

  const mockSaveArticle = new sfn.Pass(stack, "Save Article - Mock").next(
    new sfn.Succeed(stack, "Article Saved")
  );

  const checkTitle = new sfn.Choice(stack, "Check Title")
    .when(
      sfn.Condition.stringMatches("$.title", "forbidden"),
      manualApprovalLambdaTask.next(
        new sfn.Choice(stack, "Approved?")
          .when(
            sfn.Condition.booleanEquals("$.isApproved", true),
            mockSaveArticle,
            { comment: "Approved!" }
          )
          .otherwise(
            new sfn.Pass(stack, "Article Rejected - Inform user - Mock")
          )
      )
    )
    .otherwise(mockSaveArticle);

  const stateMachine = new sfn.StateMachine(stack, "ContentModeration", {
    definition: checkTitle,
  });

  // // IAM Permissions
  stateMachine.grantStartExecution(apiLambda);
  stateMachine.grantRead(apiLambda);
  apiLambda.addEnvironment("STATE_MACHINE_ARN", stateMachine.stateMachineArn);

  return { stateMachine };
}
