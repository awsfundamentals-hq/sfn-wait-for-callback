import * as sfn from "aws-cdk-lib/aws-stepfunctions";
import * as tasks from "aws-cdk-lib/aws-stepfunctions-tasks";
import { Function, StackContext, use } from "sst/constructs";
import { RequestTable } from "./Table";
import { Api } from "./Api";
import * as iam from "aws-cdk-lib/aws-iam";
export function StepFunction({ stack }: StackContext) {
  const { requestsTable } = use(RequestTable);
  const { apiLambda } = use(Api);

  // Lambda Function that receives the callback from the manual approval
  const approvalReceiverLambda = new Function(stack, "ApprovalReceiverLambda", {
    handler: "packages/functions/src/approval-receiver.handler",
    url: true,
    bind: [requestsTable],
    // Adding it as an .env var as well because I need to use an older SST Version and I can't import the binding rn
    environment: {
      REQUESTS_TABLE_NAME: requestsTable.tableName,
    },
  });

  // Lambda function to notify admin -- stack is actual just a mock to wait for the callback
  const saveApprovalLambda = new Function(stack, "NotifyLambda", {
    handler: "packages/functions/src/ask-approval.handler",
    bind: [requestsTable],

    environment: {
      APPROVAL_RECEIVER_URL: approvalReceiverLambda.url!,
      REQUESTS_TABLE_NAME: requestsTable.tableName,
    },
  });

  // Step Function
  const manualApprovalLambdaTask = new tasks.LambdaInvoke(
    stack,
    "Ask For Manual Approval",
    {
      lambdaFunction: saveApprovalLambda,
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
            mockSaveArticle
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

  // This is far away from best practice (see *) but CloudFormation just sucks with Cyclical Dependencies so I don't want to spend any more time on this
  // Don't do the star on prod. I'm sorry IAM God.
  approvalReceiverLambda.addToRolePolicy(
    new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ["states:SendTaskSuccess"],
      resources: ["*"],
    })
  );

  return { stateMachine };
}
