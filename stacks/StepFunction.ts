import { StackContext, Table, Function } from "sst/constructs";
import * as cdk from "aws-cdk-lib";
import * as sfn from "aws-cdk-lib/aws-stepfunctions";
import * as tasks from "aws-cdk-lib/aws-stepfunctions-tasks";

export function StepFunction({ stack }: StackContext) {
  // Lambda function to notify admin -- stack is actual just a mock to wait for the callback
  const notifyLambda = new Function(stack, "NotifyLambda", {
    handler: "src/lambda.handler",
  });

  // Lambda Function URL to continue Step Function
  const apiLambda = new Function(stack, "Api", {
    handler: "src/api.handler",
    url: true,
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
      }),
    }
  );

  const checkTitle = new sfn.Choice(stack, "Check Title22")
    .when(
      sfn.Condition.stringMatches("$.input.title", "forbidden"),
      manualApprovalLambdaTask.next(
        new sfn.Choice(stack, "Approved?")
          .when(
            sfn.Condition.booleanEquals("$.isApproved", true),
            new sfn.Pass(stack, "Save Article")
          )
          .otherwise(new sfn.Succeed(stack, "Article not approved"))
      )
    )
    .otherwise(new sfn.Succeed(stack, "Article approved"));

  new sfn.StateMachine(stack, "MyStateMachine", {
    definition: checkTitle,
    stateMachineName: "MyStateMachine",
  });
}
