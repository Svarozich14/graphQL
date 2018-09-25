'use strict';

const express = require('express');
const graphqlHTTP = require('express-graphql');
const { 
  GraphQLNonNull,
  GraphQLList,
  GraphQLInputObjectType,
GraphQLID,
GraphQLSchema,
GraphQLObjectType,
GraphQLString,
GraphQLInt,
GraphQLBoolean } = require('graphql');
const { nodeInterface, nodeField } = require('./src/node')
const {
  globalIdField,
  connectionDefinitions,
  connectionFromPromisedArray,
  connectionArgs,
  mutationWithClientMutationId
 } = require('graphql-relay')

const { getVideoById, getVideos,  createVideo } = require('./src/data') 

const PORT = process.env.PORT || 4000;
const server = express();

const instructorType = new GraphQLObjectType({
  name: 'instructor',
  description: 'instructor type definition',
  fields: {
    id: {
          type: GraphQLID,
          description: 'The id of the video.',
    },
  },
  interfaces: [nodeInterface]
})

const videoType = new GraphQLObjectType({
  name: 'Video',
  description: 'A video on syte',
  fields: {
    id: globalIdField(),
    title: {
      type: GraphQLString,
      description: 'The title of the video.'
    },
    duration: {
      type: GraphQLInt,
      description: 'The description of the video.'
    },
    watched: {
      type: GraphQLBoolean,
      description: 'Whether or not the viewer has watched the video.'
    },
  },
  interfaces: [nodeInterface]
})

exports.videoType = videoType;


const { connectionType: VideoConnection } = connectionDefinitions({
  nodeType: videoType,
  connectionFields: () => ({
    totalCount: {
      type: GraphQLInt,
      description: 'A count of the total number of objects in this connection',
      resolve: (conn) => {
        return conn.edges.length;
      }
    }
  })
})

const queryType = new GraphQLObjectType({
  name: 'QueryType',
  description: 'The root query type.',
  fields: {
    node: nodeField,
    video: {
      type: videoType,
      args: {
        id: {
          type: new GraphQLNonNull(GraphQLID),
          description: 'The id of the video.'
        }
      },
      resolve: (_, args) => {
        return getVideoById(args.id)
      }
    },
    videos: {
      type: VideoConnection,
      args: connectionArgs,
      resolve: (_, args) => connectionFromPromisedArray(
          getVideos(),
          args
        ),
    }
  }
})

const videoMutation = mutationWithClientMutationId({
  name: 'AddVideo',
  inputFields: {
     title: {
          type: new GraphQLNonNull(GraphQLString),
          description: 'The title of the video.'
        },
        duration: {
          type: new GraphQLNonNull(GraphQLInt),
          description: 'The description of the video.'
        },
        released: {
          type: new GraphQLNonNull(GraphQLBoolean),
          description: 'Whether OR NOT THE VIDEO IS released.'
        }
  },
  outputFields: {
    video: {
      type: videoType
    }
  },
  mutateAndGetPayload: (args) => new Promise((resolve, reject) => {
    Promise.resolve(createVideo(args))
      .then((video) => resolve({ video }))
      .catch(reject);
  })
})

const mutationType = new GraphQLObjectType({
  name: 'Mutation',
  description: 'The root Mutation type.',
  fields: {
    createVideo: videoMutation
  }
})

const schema = new GraphQLSchema({
  query: queryType,
  mutation: mutationType
})

server.use('/graphql', graphqlHTTP({
  schema,
  graphiql: true
}))

server.listen(PORT, () => {
  console.log(`lesten port: ${PORT}`)
})