import AWS from 'aws-sdk';
import createError from 'http-errors';

import commonMiddleware from '../lib/commonMiddleware';
import { getAuctionById } from './getAuction';

// Perform interactions with the DDB table
const dynamodb = new AWS.DynamoDB.DocumentClient();

async function placeBid(event, context) {
  const { id } = event.pathParameters;
  const { amount } = event.body;
  
  // Check if auction already exists
  const auction = await getAuctionById(id);

  if (amount <= auction.highestBid.amount) {
    throw new createError.Forbidden(`Your bid must be higher that ${auction.highestBid.amount}`);
  }

  // dynamodb update params
  const params  = {
    TableName: process.env.AUCTIONS_TABLE_NAME,
    Key: { id },
    UpdateExpression: 'set highestBid.amount = :amount',
    ExpressionAttributeValues: {
      ':amount': amount,
    },
    ReturnValues: 'ALL_NEW',
  };

  let updatedAuction;

  try {
    const result = await dynamodb.update(params).promise();
    updatedAuction = result.Attributes;
  } catch(error) {
    console.log(error);
    throw new createError.InternalServerError(error);
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ updatedAuction }),
  };
}

// Export your function as a named defn
/*
http body parser - parses event body as json
normalizer - catches any path related errors etc.
error handler - makes error handling smoother
*/
export const handler = commonMiddleware(placeBid);