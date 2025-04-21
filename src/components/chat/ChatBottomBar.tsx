import { AnimatePresence, motion } from "framer-motion";
import { Image as ImageIcon, Loader, SendHorizontal, ThumbsUp } from "lucide-react";
import Image from "next/image";
import { Textarea } from "../ui/textarea";
import { useEffect, useRef, useState } from "react";
import EmojiPicker from "./EmojiPicker";
import { Button } from "../ui/button";
import useSound from "use-sound";
import { usePreferences } from "@/store/usePreferences";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { sendMessageAction } from "@/actions/message.actions";
import { useSelectedUser } from "@/store/useSelectedUser";
import { CldUploadWidget, CloudinaryUploadWidgetInfo } from "next-cloudinary";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import { pusherClient } from "@/lib/pusher";
import { Message } from "@/db/dummy";
import { LocalCloudinaryWidget, isLocalDev as checkIsLocalDev } from "@/lib/cloudinary-local";

const ChatBottomBar = () => {
	const [message, setMessage] = useState("");
	const textAreaRef = useRef<HTMLTextAreaElement>(null);
	const { selectedUser } = useSelectedUser();
	const { user: currentUser } = useKindeBrowserClient();

	const { soundEnabled } = usePreferences();
	const queryClient = useQueryClient();

	const [imgUrl, setImgUrl] = useState("");

	const [playSound1] = useSound("/sounds/keystroke1.mp3");
	const [playSound2] = useSound("/sounds/keystroke2.mp3");
	const [playSound3] = useSound("/sounds/keystroke3.mp3");
	const [playSound4] = useSound("/sounds/keystroke4.mp3");

	const [playNotificationSound] = useSound("/sounds/notification.mp3");

	const playSoundFunctions = [playSound1, playSound2, playSound3, playSound4];

	const playRandomKeyStrokeSound = () => {
		const randomIndex = Math.floor(Math.random() * playSoundFunctions.length);
		soundEnabled && playSoundFunctions[randomIndex]();
	};

	const { mutate: sendMessage, isPending } = useMutation({
		mutationFn: sendMessageAction,
	});

	// Determine if we're in local development mode
	const [isLocalDev, setIsLocalDev] = useState(false);
	
	useEffect(() => {
		setIsLocalDev(checkIsLocalDev());
		console.log('Local development mode:', process.env.NEXT_PUBLIC_USE_LOCAL_SERVICES);
	}, []);

	const handleSendMessage = () => {
		if (!message.trim()) return;
		console.log('Sending message:', message, 'to user:', selectedUser?.id);

		try {
			// Send the message
			sendMessage({ 
				content: message, 
				messageType: "text", 
				receiverId: selectedUser?.id! 
			}, {
				onSuccess: (data) => {
					console.log('Message sent successfully:', data);
					
					// In local development, manually add the message to the UI
					if (isLocalDev && currentUser) {
						const newMessage = {
							senderId: currentUser.id,
							content: message,
							messageType: "text",
							timestamp: Date.now()
						};
						
						queryClient.setQueryData(["messages", selectedUser?.id], (oldMessages: Message[] = []) => {
							return [...oldMessages, newMessage];
						});
					}
				},
				onError: (error) => {
					console.error('Error sending message:', error);
				}
			});
			
			setMessage("");
			textAreaRef.current?.focus();
		} catch (error) {
			console.error('Exception sending message:', error);
		}
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSendMessage();
		}

		if (e.key === "Enter" && e.shiftKey) {
			e.preventDefault();
			setMessage(message + "\n");
		}
	};

	useEffect(() => {
		const channelName = `${currentUser?.id}__${selectedUser?.id}`.split("__").sort().join("__");
		const channel = pusherClient?.subscribe(channelName);

		const handleNewMessage = (data: { message: Message }) => {
			queryClient.setQueryData(["messages", selectedUser?.id], (oldMessages: Message[]) => {
				return [...oldMessages, data.message];
			});

			if (soundEnabled && data.message.senderId !== currentUser?.id) {
				playNotificationSound();
			}
		};

		channel.bind("newMessage", handleNewMessage);

		// ! Absolutely important, otherwise the event listener will be added multiple times which means you'll see the incoming new message multiple times
		return () => {
			channel.unbind("newMessage", handleNewMessage);
			pusherClient.unsubscribe(channelName);
		};
	}, [currentUser?.id, selectedUser?.id, queryClient, playNotificationSound, soundEnabled]);

	return (
		<div className='p-2 flex justify-between w-full items-center gap-2'>
			{!message.trim() && (
				<>
				{isLocalDev ? (
					// Use our local image upload in local development
					<Button
						variant="ghost"
						size="icon"
						className="rounded-full"
						onClick={() => {
							const widget = new LocalCloudinaryWidget({
								onSuccess: (result, { widget }) => {
									setImgUrl(result.info.secure_url);
									// Send the image message immediately
									sendMessage({
										content: result.info.secure_url,
										messageType: "image",
										receiverId: selectedUser?.id!
									});
								}
							});
							widget.open();
						}}
					>
						<ImageIcon className="h-5 w-5" />
					</Button>
				) : (
					// Use normal Cloudinary in production
					<CldUploadWidget
						signatureEndpoint={"/api/sign-cloudinary-params"}
						onSuccess={(result, { widget }) => {
							setImgUrl((result.info as CloudinaryUploadWidgetInfo).secure_url);
							widget.close();
						}}
					>
					{({ open }) => {
						return (
							<ImageIcon
								size={20}
								onClick={() => open()}
								className='cursor-pointer text-muted-foreground'
							/>
						);
					}}
					</CldUploadWidget>
				)}
				</>
			)}

			{imgUrl && (
				<Dialog
					open={!!imgUrl}
					onOpenChange={(open) => !open && setImgUrl("")}
				>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Send Image</DialogTitle>
						</DialogHeader>

						<div className="relative aspect-square">
							{imgUrl.startsWith('blob:') ? (
								// Local development blob URL
								<img
									src={imgUrl}
									alt="image"
									className="object-cover w-full h-full"
								/>
							) : (
								// Production Cloudinary URL
								<Image
									src={imgUrl}
									alt="image"
									fill
									className="object-cover"
								/>
							)}
						</div>

						<DialogFooter className="flex w-full justify-end">
							<Button
								size="sm"
								onClick={() => setImgUrl("")}
								variant={"outline"}
							>
								Cancel
							</Button>
							<Button
								size="sm"
								disabled={isPending}
								onClick={() => {
									sendMessage({
										content: imgUrl,
										messageType: "image",
										receiverId: selectedUser?.id!
									});
									setImgUrl("");
								}}
							>
								Send
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			)}

			<AnimatePresence>
				<motion.div
					layout
					initial={{ opacity: 0, scale: 1 }}
					animate={{ opacity: 1, scale: 1 }}
					exit={{ opacity: 0, scale: 1 }}
					transition={{
						opacity: { duration: 0.5 },
						layout: {
							type: "spring",
							bounce: 0.15,
						},
					}}
					className='w-full relative'
				>
					<Textarea
						autoComplete='off'
						placeholder='Aa'
						rows={1}
						className='w-full border rounded-full flex items-center h-9 resize-none overflow-hidden
						bg-background min-h-0'
						value={message}
						onKeyDown={handleKeyDown}
						onChange={(e) => {
							setMessage(e.target.value);
							playRandomKeyStrokeSound();
						}}
						ref={textAreaRef}
					/>
					<div className='absolute right-2 bottom-0.5'>
						<EmojiPicker
							onChange={(emoji) => {
								setMessage(message + emoji);
								if (textAreaRef.current) {
									textAreaRef.current.focus();
								}
							}}
						/>
					</div>
				</motion.div>

				{message.trim() ? (
					<Button
						className='h-9 w-9 dark:bg-muted dark:text-muted-foreground dark:hover:bg-muted dark:hover:text-white shrink-0'
						variant={"ghost"}
						size={"icon"}
						onClick={handleSendMessage}
					>
						<SendHorizontal size={20} className='text-muted-foreground' />
					</Button>
				) : (
					<Button
						className='h-9 w-9 dark:bg-muted dark:text-muted-foreground dark:hover:bg-muted dark:hover:text-white shrink-0'
						variant={"ghost"}
						size={"icon"}
					>
						{!isPending && (
							<ThumbsUp
								size={20}
								className='text-muted-foreground'
								onClick={() => {
									sendMessage({ content: "👍", messageType: "text", receiverId: selectedUser?.id! });
								}}
							/>
						)}
						{isPending && <Loader size={20} className='animate-spin' />}
					</Button>
				)}
			</AnimatePresence>
		</div>
	);
};
export default ChatBottomBar;
