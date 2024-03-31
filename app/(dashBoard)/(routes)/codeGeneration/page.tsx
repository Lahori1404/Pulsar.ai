"use client";
import axios from "axios"
import * as z from "zod";
import { Heading } from "@/components/heading";
import { Code, Divide } from "lucide-react";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { formSchema } from "./constants";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChatCompletionMessageParam, ChatCompletionMessage } from "openai/resources/index.mjs";
import { useState } from "react";
import { EmptyView } from "@/components/emptyView";
import { Loader } from "@/components/loader";
import { UserAvatar } from "@/components/user-avatar";
import { BotAvatar } from "@/components/bot-avatar";
import ReactMarkdown from "react-markdown"
import { cn } from "@/lib/utils";

const CodeGenerationPage = () => {
    
    const router = useRouter();
    const [messages, setMessages] = useState<any[]>([]);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            prompt:""
        }
    });

    const isLoading = form.formState.isSubmitting;

    const onSubmit = async (values: z.infer<typeof formSchema>) => {

        try {
            const userMessage: ChatCompletionMessageParam = {
                role: "user",
                content: values.prompt
            }
            const newMessages = [...messages, userMessage]
            const response = await axios.post("/api/codeGeneration", {
                messages: newMessages
            });
            setMessages((current) => [...current, userMessage, response.data])
            form.reset()
        } catch (error: any) {
            //TODO: Open Pro Model
            console.log(values);
        } finally {
            router.refresh();
        }
        //console.log(values);
    }

    return (
        <div>
            <Heading 
            title= "Code Generation"
            description= "Your companion for seamless coding"
            icon={Code}
            iconColor="text-green-500"
            bgColor="bg-green-500/10"/>
            <div className="px-4 lg:px-8">
                <div>
                    <Form {...form}>
                        <form 
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="rounded-lg border w-full p-4 px-3 mdpx-6 focus-within:shadow-sm grid grid-cols-12 gap-2">
                            <FormField name="prompt"
                            render = {({ field }) => (
                                <FormItem className="col-span-12 lg:col-span-10">
                                    <FormControl className="m-0 p-0">
                                        <Input className="border-0 outline-none focus-visible:ring-0 focus-visible:ring-transparent" 
                                               disabled = {isLoading}
                                               placeholder="Function to add numbers in python ?" {...field}/>
                                    </FormControl>
                                </FormItem>
                            )}/>
                            <Button className="col-span-12 lg:col-span-2 w-full" disabled={isLoading}>
                                Generate
                        </Button>
                        </form>
                    </Form>
                </div>
                <div className="space-y-4 mt-4">
                    {isLoading && (
                    <div className="p-8 w-full flex items-center justify-center">
                    <Loader/>
                    </div>
                    )}
                    {messages.length === 0 && !isLoading && (
                    <EmptyView label="No conversation Started"/>
                    )}
                    <div className="flex flex-col-reverse gap-y-4">
                        {messages.map((message) => (
                            <div key={message.content} className={cn(
                                "p-8 w-full flex items-start gap-x-8 rounded-lg",
                                message.role == "user" ? "bg-white border border-black/10" : "bg-muted" )}>
                               {message.role == "user" ? <UserAvatar/> : <BotAvatar/>}
                               <p className="text-sm">
                               <ReactMarkdown components={{
                                pre: ({node, ...props}) => (
                                    <div className="overflow-auto w-full my-2 bg-black/10 p-2 rounded-lg">
                                        <pre {...props} />
                                    </div>
                                ),
                                code: ({node, ...props}) => (
                                    <code className="bg-black/10 rounded-lg p-1" {...props}/>
                                )
                               }} className="text-sm overflow-hidden leading-7">
                                {message.content || ""}
                               </ReactMarkdown>
                               </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CodeGenerationPage;