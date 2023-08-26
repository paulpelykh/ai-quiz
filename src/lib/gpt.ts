import { Configuration, OpenAIApi } from 'openai';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export async function strict_output(
  system_prompt: any,
  user_prompt: any,
  output_format: any
) {
  const response = await openai.createChatCompletion({
    model: 'gpt-3.5-turbo',
    messages: [
      { role: 'system', content: system_prompt },
      { role: 'user', content: user_prompt.toString() },
    ],
  });

  const res =
    response.data.choices[0].message?.content?.replace(/'/g, '"') || '';

  const output = JSON.parse(res);
  return output;
}
