'use client';
import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card';
import { useForm } from 'react-hook-form';
import { quizCreationSchema } from '@/schemas/form/quiz';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from './ui/form';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { BookOpen, CopyCheck } from 'lucide-react';
import { Separator } from '@radix-ui/react-dropdown-menu';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import LoadingQuestions from './LoadingQuestions';

type Props = {
  topicParam: string;
};

type Input = z.infer<typeof quizCreationSchema>;

const QuizCreation = ({ topicParam }: Props) => {
  const router = useRouter();
  const [showLoader, setShowLoader] = React.useState(false);
  const [finished, setFinished] = React.useState(false);
  const { mutate: getQuestions, isLoading } = useMutation({
    mutationFn: async ({ amount, topic, type }: Input) => {
      const response = await axios.post('/api/game', {
        amount,
        topic,
        type,
      });
      return response.data;
    },
  });

  const form = useForm<Input>({
    resolver: zodResolver(quizCreationSchema),
    defaultValues: {
      amount: 3,
      topic: topicParam,
      type: 'mcq',
    },
  });

  function onSubmit(input: Input) {
    setShowLoader(true);
    getQuestions(
      {
        amount: input.amount,
        topic: input.topic,
        type: input.type,
      },
      {
        onSuccess: ({ gameId }) => {
          setFinished(true);
          setTimeout(() => {
            // if (form.getValues('type') === 'open_ended') {
            //   router.push(`/play/open-ended/${gameId}`);
            // } else {
            //   router.push(`/play/mcq/${gameId}`);
            // }
            router.push(`/play/mcq/${gameId}`);
          }, 1000);
        },
        onError: () => {
          setShowLoader(false);
        },
      }
    );
  }

  form.watch();

  if (showLoader) {
    return <LoadingQuestions finished={finished} />;
  }

  return (
    <div className='absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2'>
      <Card>
        <CardHeader>
          <CardTitle className='text-2x font-bold'>Quiz Creation</CardTitle>
          <CardDescription>Choose a topic</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
              <FormField
                control={form.control}
                name='topic'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Topic</FormLabel>
                    <FormControl>
                      <Input placeholder='Enter a topic...' {...field} />
                    </FormControl>
                    <FormDescription>Please provide a topic</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='amount'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Questions</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Enter an amount...'
                        {...field}
                        type='number'
                        min={1}
                        max={2}
                        onChange={e => {
                          form.setValue('amount', parseInt(e.target.value));
                        }}
                      />
                    </FormControl>
                    <FormDescription>Please provide a topic</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* <div className="flex justify-between">
                <Button
                  variant={
                    form.getValues('type') === 'mcq' ? 'default' : 'secondary'
                  }
                  className="w-1/2 rounded-none rounded-l-lg"
                  onClick={() => {
                    form.setValue('type', 'mcq');
                  }}
                  type="button"
                >
                  <CopyCheck className="w-4 h-4 mr-2" /> Multiple Choice
                </Button>
                <Separator />
                <Button
                  variant={
                    form.getValues('type') === 'open_ended'
                      ? 'default'
                      : 'secondary'
                  }
                  className="w-1/2 rounded-none rounded-r-lg"
                  onClick={() => form.setValue('type', 'open_ended')}
                  type="button"
                >
                  <BookOpen className="w-4 h-4 mr-2" /> Open Ended
                </Button>
              </div> */}
              <Button
                disabled={isLoading}
                type='submit'
                className='flex mx-auto'
              >
                Submit
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuizCreation;
