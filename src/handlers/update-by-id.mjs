// Create clients and set shared const values outside of the handler.

// Create a DocumentClient that represents the query to add an item
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
// const client = new DynamoDBClient({
//   endpoint: "http://host.docker.internal:8000",
//   region: "local-env",
//   credentials: {
//     accessKeyId: "fakeMyKeyId",
//     secretAccessKey: "fakeSecretAccessKey",
//   },
// });
const ddbDocClient = DynamoDBDocumentClient.from(client);

// Get the DynamoDB table name from environment variables
const tableName = process.env.SAMPLE_TABLE;

/**
 * A simple example includes a HTTP post method to add one item to a DynamoDB table.
 */
export const updateItemHandler = async (event) => {
  if (event.httpMethod !== "PUT") {
    throw new Error(
      `putMethod only accepts PUT method, you tried: ${event.httpMethod} method.`
    );
  }
  // All log statements are written to CloudWatch
  //console.info("received:", event);

  // Get id and name from the body of the request
  const body = JSON.parse(event.body);
  const id = event.pathParameters.id;

  const name = body.name;
  const done = body.done;

  // Creates a new item, or replaces an old item with a new item
  // https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html#put-property
  var params = {
    TableName: tableName,
    Item: { id: id, name: name, done: done },
  };

  try {
    const data = await ddbDocClient.send(new PutCommand(params));
    console.log("Success - item added or updated", data);
  } catch (err) {
    console.error("ERROOOOOR", err);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Failed to update item",
        details: err.message,
      }),
    };
  }

  const response = {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "OPTIONS,PUT,POST,GET,DELETE",
    },
    body: JSON.stringify(body),
  };

  // All log statements are written to CloudWatch
  console.info(
    `response from: ${event.path} statusCode: ${response.statusCode} body: ${response.body}`
  );
  return response;
};
