"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.populateCollection = exports.maCollection = exports.firestore = void 0;
const firestore_1 = require("@google-cloud/firestore");
// process.env.GOOGLE_APPLICATION_CREDENTIALS = 'firestore.json'
const firestore = new firestore_1.Firestore();
exports.firestore = firestore;
const converter = () => ({
    toFirestore: (data) => data,
    fromFirestore: (snap) => snap.data(),
});
const maCollection = (collectionPath) => firestore.collection(collectionPath).withConverter(converter());
exports.maCollection = maCollection;
/**
 * converts an array of document paths to forestore document references
 */
const convertToDocumentReference = (collection, documentIds) => {
    const questionRefs = documentIds.map((documentId) => {
        return firestore.doc(collection + '/' + documentId);
    });
    return questionRefs;
};
const populateCollection = (collection, ids) => {
    const docRefs = convertToDocumentReference(collection, ids);
    return firestore.getAll(...docRefs);
};
exports.populateCollection = populateCollection;
exports.default = firestore;
//https://cloud.google.com/nodejs/docs/reference/firestore/latest/firestore/query#_google_cloud_firestore_Query_offset_member_1_
