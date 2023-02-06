import { app } from './app';
const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '../.env') })

const port = process.env.PORT || 4010;

app.listen(port, () =>
    console.log(`Text Completion API listening at http://localhost:${port}`)
);
