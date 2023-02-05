# Text Completion API
A Text Completion API that predicts the next word in a given text.

## Prerequisites
Before you begin, ensure you have the following installed:
* Node.js
* npm

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
npm install 
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
yarn start 
```
This will start the API server at http://localhost:4010.

## API Documentation
The API documentation for the Text Completion API can be found at http://<root-url>/docs. This documentation includes information on the API endpoint structure, request and response payloads, and API parameters. The documentation is generated using the OpenAPI specification and provides a clear and concise overview of the API functionality.

### Fine-Tuning
The Text Completion API uses a fine-tuned language model for text prediction. The fine-tuning process involves training the language model on a large corpus of text data to make it more specialized for the task of text completion.

### Text-Davinci-003
The Text Completion API uses the Text-Davinci-003 language model developed by OpenAI. Text-Davinci-003 is a transformer-based language model that has been fine-tuned on a large corpus of text data for the task of text completion. It provides high-quality predictions for the next word in a given text.

## Built With

- [TypeScript](https://www.typescriptlang.org/) 
- [TSOA](https://github.com/lukeautry/tsoa)

## Contributing
If you'd like to contribute to the project, please fork the repository and create a pull request with your changes.
License
This project is licensed under the MIT License.