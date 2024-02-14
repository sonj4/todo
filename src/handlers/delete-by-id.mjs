import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, DeleteCommand } from "@aws-sdk/lib-dynamodb";
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

const tableName = process.env.SAMPLE_TABLE;

export const deleteByIdHandler = async (event) => {
  if (event.httpMethod !== "DELETE") {
    throw new Error(
      `deleteByIdHandler only accepts DELETE method, you tried: ${event.httpMethod}`
    );
  }

  console.info("received:", event);
  const id = event.pathParameters.id;
  var params = {
    TableName: tableName,
    Key: { id: id },
  };
  try {
    const data = await ddbDocClient.send(new DeleteCommand(params));
    console.log("Delete operation successful", data);
  } catch (err) {
    console.error("Error", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to delete item" }),
    };
  }
  const response = {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "OPTIONS,POST,GET,DELETE",
    },
    body: JSON.stringify({ message: "Item deleted successfully" }),
  };

  console.info(
    `response from: ${event.path} statusCode: ${response.statusCode} body: ${response.body}`
  );
  return response;
};
