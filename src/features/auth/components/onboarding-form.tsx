'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useOnboardMutation } from '@/features/auth/hooks/useOnboardMutation';
import { OnboardRequestSchema } from '@/features/auth/lib/dto';
import type { OnboardRequest } from '@/features/auth/lib/dto';
import { Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

import type { OnboardResponse } from '@/features/auth/lib/dto';

type OnboardingFormProps = {
  onSuccess?: (data: OnboardResponse) => void;
};

export const OnboardingForm = ({ onSuccess }: OnboardingFormProps) => {
  const { mutate: onboard, isPending: isOnboarding, error } = useOnboardMutation();
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Create a form schema that includes termsAgreed validation
  const formSchema = OnboardRequestSchema.extend({
    termsAgreed: z.boolean().refine(value => value === true, {
      message: '이용 약관에 동의해야 합니다.'
    })
  });
  
  type FormData = z.infer<typeof formSchema>;

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
      role: 'learner',
      fullName: '',
      phone: '',
      termsAgreed: false,
    },
  });

  const onSubmit = (data: FormData) => {
    // The data.termsAgreed is guaranteed to be true due to Zod validation
    // Separate the termsAgreed from the form data for the API call
    const { termsAgreed: _, ...requestPayload } = data;
    
    onboard({ ...requestPayload, termsAgreed: data.termsAgreed }, {
      onSuccess: (response) => {
        if (onSuccess) {
          onSuccess(response);
        }
      },
      onError: (error) => {
        setErrorMessage(error.message || '회원가입에 실패했습니다. 다시 시도해주세요.');
        setErrorDialogOpen(true);
      },
    });
  };

  return (
    <>
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">회원가입</CardTitle>
          <CardDescription>
            아래 정보를 입력하여 계정을 생성하세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Email Field */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>이메일</FormLabel>
                    <FormControl>
                      <Input 
                        type="email" 
                        placeholder="이메일을 입력하세요" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Password Field */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>비밀번호</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="비밀번호를 입력하세요" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Role Selection */}
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>역할</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex space-x-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="learner" id="learner" />
                          <Label htmlFor="learner">학습자</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="instructor" id="instructor" />
                          <Label htmlFor="instructor">강사</Label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Full Name Field */}
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>이름</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="이름을 입력하세요" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Phone Field */}
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>휴대폰번호</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="010-1234-5678 형식으로 입력하세요" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Terms Agreement */}
              <FormField
                control={form.control}
                name="termsAgreed"
                render={({ field }) => (
                  <div className="space-y-2">
                    <div className="flex items-start space-x-2">
                      <input
                        type="checkbox"
                        id="termsAgreed"
                        checked={field.value || false}
                        onChange={field.onChange}
                        className="mt-1 h-4 w-4 rounded border-input bg-background"
                      />
                      <div>
                        <Label htmlFor="termsAgreed" className="text-sm font-medium">
                          이용 약관에 동의합니다
                        </Label>
                        <p className="text-xs text-muted-foreground mt-1">
                          서비스 이용약관, 개인정보처리방침 등에 동의합니다.
                        </p>
                      </div>
                    </div>
                    {form.formState.errors.termsAgreed && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.termsAgreed.message}
                      </p>
                    )}
                  </div>
                )}
              />

              {/* Error Message */}
              {error && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  {error.message}
                </div>
              )}

              {/* Submit Button */}
              <Button type="submit" className="w-full" disabled={isOnboarding}>
                {isOnboarding && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                계정 생성
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Error Dialog */}
      <Dialog open={errorDialogOpen} onOpenChange={setErrorDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>오류 발생</DialogTitle>
            <DialogDescription>
              {errorMessage}
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
};