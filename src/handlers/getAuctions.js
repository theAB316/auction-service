import AWS from 'aws-sdk';
import createError from 'http-errors';

import commonMiddleware from '../lib/commonMiddleware';

// Perform interactions with the DDB table
const dynamodb = new AWS.DynamoDB.DocumentClient();

async function getAuctions(event, context) {
  // Define auctions variable
  let auctions;

  try {
    const result = await dynamodb.scan({
        TableName: process.env.AUCTIONS_TABLE_NAME
    }).promise();

    auctions = result.Items;

  } catch (error) {
      console.log(error);
      throw new createError.InternalServerError(error);
  }
  
  return {
    statusCode: 200,
    body: JSON.stringify({ auctions }),
  };
}

// Export your function as a named defn
/*
http body parser - parses event body as json
normalizer - catches any path related errors etc.
error handler - makes error handling smoother
*/
export const handler = commonMiddleware(getAuctions);