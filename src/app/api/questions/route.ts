import { NextResponse } from 'next/server';
import { quizCreationSchema } from '@/schemas/form/quiz';
import { ZodError } from 'zod';
import { strict_output } from '@/lib/gpt';
// import { getAuthSession } from '@/lib/nextauth';

export const runtime = 'edge';

// api/questions
export const POST = async (req: Request, res: Response) => {
  try {
    // const session = await getAuthSession();
    // if (!session?.user) {
    //   return NextResponse.json(
    //     {
    //       error: 'You must be logged in to create a quiz',
    //     },
    //     {
    //       status: 401,
    //     }
    //   );
    // }
    const body = await req.json();
    const { amount, topic, type } = quizCreationSchema.parse(body);
    let questions: any;
    if (type === 'open_ended') {
      questions = await strict_output(
        'You are a helpful AI that is able to generate a pair of questions and answers, the lenght should not exeed 15 words, store all the pairs of answers and questions in a JSON array'
        // {
        //   question: 'question',
        //   answer: 'answer with max length of 15 words',
        // }
      );
    } else if (type === 'mcq') {
      questions = await strict_output(
        `I want to make a quiz about ${topic}.
        I want ${amount} questions, with 4 answers per question.
        The questions should be in English.
        Please give me 1 correct answer for each question.
        The question can not be longer than 120 characters, and the answers can not be longer than 75 characters.`
      );
    }
    return NextResponse.json(
      {
        questions,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: error.issues,
        },
        {
          status: 400,
        }
      );
    }
  }
};
