import { Configuration, OpenAIApi } from 'openai';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

interface OutputFormat {
  [key: string]: string | string[] | OutputFormat;
}
// export interface Question {
//   question: string;
//   answers: string[];
//   correctAnswerPositions: number[];
// }
export interface Question {
  question: string;
  answer: string;
  option1: string;
  option2: string;
  option3: string;
}
export interface QueryQuestionsResponse {
  questions: Question[];
  requestMessage: string;
  responseMessage: string;
}

export interface ResultType {
  questions: Question[];
  requestMessage: string;
  responseMessage: string;
}

export async function strict_output(
  // system_prompt: string,
  user_prompt: string | string[],
  output_format: string = `Format: Question|Answer1|Answer2|Answer3|Answer4
A # mark indicates the correct answer.
Each question and its answers should be on a single line.
Before each question, please write the question number with a $ sign in front.
Example response: 
"$1. What is the capital of France?|Paris#|London|Berlin|Madrid
$2. How many letters are in the english alphabet?|30|24|28|26#"`,
  default_category: string = '',
  output_value_only: boolean = false,
  model: string = 'gpt-3.5-turbo',
  temperature: number = 1,
  num_tries: number = 3,
  verbose: boolean = false
) {
  let error_msg: string = '';

  // Use OpenAI to get a response
  const response = await openai.createChatCompletion({
    temperature: temperature,
    model: model,
    messages: [
      {
        role: 'system',
        content: output_format + error_msg,
      },
      { role: 'user', content: user_prompt.toString() },
    ],
  });

  const message = `message`;

  let res: string =
    response.data.choices[0].message?.content?.replace(/'/g, '"') ?? '';

  const questions: Question[] = [];
  for (const line of res.split('\n')) {
    if (line.startsWith('$') || line.match(/^\d/)) {
      // If line starts with a $ or a number
      const line_split = line.split('|');
      let [first, ...rest] = line_split[0].split('. ');
      const question = rest.join('. ').trim(); // Remove the question number
      const answers = line_split.slice(1).map(x => x.trim());
      const correctAnswerPositions = answers
        .map((a, i) => (a.includes('#') ? i : -1))
        .filter(i => i !== -1);

      // Shuffle the answers around and adjust the correct answer positions accordingly
      for (let i = answers.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [answers[i], answers[j]] = [answers[j], answers[i]];
        correctAnswerPositions.forEach((p, k) => {
          if (p === i) correctAnswerPositions[k] = j;
          else if (p === j) correctAnswerPositions[k] = i;
        });
      }

      const correctAnswerIndex = correctAnswerPositions[0];
      const correctAnswer = answers[correctAnswerIndex];
      // delete right answer from answers
      answers.splice(correctAnswerIndex, 1);
      const options = answers.map(a => a.replace('#', ''));
      questions.push({
        question,
        answer: correctAnswer.replace('#', ''),
        option1: options[0],
        option2: options[1],
        option3: options[2],
      });
    }
  }
  const r: ResultType = {
    questions: questions,
    requestMessage: message,
    responseMessage: res,
  };

  return questions;
}
