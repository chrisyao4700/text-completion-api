# Text Completion API
A Text Completion API that predicts the next word in a given text.

## Prerequisites
Before you begin, ensure you have the following installed:
* [Node.js](https://nodejs.org/en/docs/)
* [npm](https://docs.npmjs.com/)

## Getting Started
These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.
1. Clone the repository:

```
git clone https://github.com/<your-username>/text-completion-api.git 
```
2. Navigate to the project directory:
```
cd text-completion-api 
```
3. Install the dependencies:
```
yarn install 
```
4. Create a .env file:
```
touch .env 
```
In the .env file, set the following environment variables:
```
PORT=4010

APP_NAME="text-completion-api"
ADMIN_USERNAME="some-username-for-admin"
ADMIN_PASSWORD="some-password-for-admin"
MS_TEMPLATE_API_KEY="abc"
```
5. Start the API server:
```
yarn tsoa:gen
yarn init-db
yarn build
yarn start
```
This will start the API server at http://localhost:4010.


## How to Use
The API documentation for the Text Completion API can be found at http://localhost:4010/docs. This documentation includes information on the API endpoint structure, request and response payloads, and API parameters. The documentation is generated using the OpenAPI specification and provides a clear and concise overview of the API functionality.

1. To create a chat, make a POST request to "/v1/chat" endpoint.
```
Body {
    "title": "New Chat"
}
```
Note: if "title" is not "New Chat", the program will NOT automatically summarize the chat and create an updated title.

2. Use the `chatId` from the response of step 1 and "text" as the body to make a POST request to "/v1/line" endpoint.
```
Body {
    "text": "Tell me a joke",
    "chatId": 1
}
```

3. To view the chat info, make a GET request to "/v1/chat/detail/:chatId" endpoint, replacing ":chatId" with the actual chatId obtained from step 1.


4. To get the pure text of lines, make a GET request to "/v1/line/all/:chatId" endpoint, replacing ":chatId" with the actual chatId obtained from step 1.


## Technology Integration
The following technologies are integrated in this project:

### Fine-Tuning
The Text Completion API uses a fine-tuned language model for text prediction. The fine-tuning process involves training the language model on a large corpus of text data to make it more specialized for the task of text completion.

### Text-Davinci-003
The Text Completion API uses the Text-Davinci-003 language model developed by OpenAI. Text-Davinci-003 is a transformer-based language model that has been fine-tuned on a large corpus of text data for the task of text completion. It provides high-quality predictions for the next word in a given text.

## TODO
* Add more test cases
    - Increase the coverage of the test cases to ensure the API's functionality is thoroughly tested.
    - Add test cases for the model and service to ensure they are working as expected.
* Add API Key authentication
    - Implement a mechanism to secure the API by adding an API Key authentication system. This will restrict unauthorized access to the API and ensure the data being passed is secure.
    - Create an admin page where API Keys can be generated and managed. This will allow for easy management of API Keys and ensure only authorized users have access to the API.


## Built With
- [TypeScript](https://www.typescriptlang.org/) 
- [TSOA](https://github.com/lukeautry/tsoa)
- [OPENAI](https://openai.com)

## Contributing
If you'd like to contribute to the project, please fork the repository and create a pull request with your changes.

## License
This project is licensed under the MIT License.