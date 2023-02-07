# Training a OpenAI Model using Fine-Tune

## Requirements
- Python 3.6 or higher
- OpenAI API Key
- pip
## Installation
To install pip, follow the instructions for your operating system from the [official pip installation guide](https://pip.pypa.io/en/stable/installation/).
## Creating Training Data
- Create a folder named jobs to store your training data.
- Create your training data in JSON format with each file named 001.json, 002.json, etc. and store them in the jobs folder.
- Ensure that the data is formatted correctly, with each file containing a single JSON object.
```
{"prompt": "Describe Michael Dai.", "completion": "Michael Dai is a fine young man. He was born in 1995. He is my creator's son."}
{"prompt": "Tell me about Michael Dai.", "completion": "Michael Dai is currently work with Amazon. He is my creator's son. He's very supportive and kind."}
{"prompt": "Do you know Michael Dai?", "completion": "As a son, he is helpful. My creator told me a lot of stories about him."}
{"prompt": "Do you know any story about Michael Dai?", "completion": "Yes. He's my creator son, my creator's favorite son. Once upon time, young Michael lost his toy, my creator bought new one for him. It was young Michael's first programming computer."}
```

## Fine-Tuning the Model
1. Create a new virtual environment and activate it.
```
python -m venv env  
source env/bin/activate
```
2. Install the required packages using pip:
```
pip install openai
```
3. Set your OPENAI_API_KEY environment variable by adding the following line into your shell initialization script (e.g. .bashrc, zshrc, etc.) or running it in the command line before the fine-tuning command:
```
export OPENAI_API_KEY="<OPENAI_API_KEY>"
```
4. Run the script to fine-tune the model:

Note: This is a basic example for fine-tuning the OpenAI model. You can modify the script according to your requirements and the parameters supported by the OpenAI API.

5. CLI data preparation tool
```
openai tools fine_tunes.prepare_data -f <LOCAL_FILE>
```
This tool accepts different formats, with the only requirement that they contain a prompt and a completion column/key. You can pass a CSV, TSV, XLSX, JSON or JSONL file, and it will save the output into a JSONL file ready for fine-tuning, after guiding you through the process of suggested changes.

6. Create a fine-tuned model
The following assumes you've already prepared training data following the above instructions.

Start your fine-tuning job using the OpenAI CLI:
```
openai api fine_tunes.create -t <TRAIN_FILE_ID_OR_PATH> -m <BASE_MODEL>
```
Where BASE_MODEL is the name of the base model you're starting from (ada, babbage, curie, or davinci). You can customize your fine-tuned model's name using the suffix parameter.
