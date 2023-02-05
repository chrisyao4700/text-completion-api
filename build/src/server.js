"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const port = process.env.PORT || 4010;
app_1.app.listen(port, () => console.log(`Text Completion app listening at http://localhost:${port}`));
