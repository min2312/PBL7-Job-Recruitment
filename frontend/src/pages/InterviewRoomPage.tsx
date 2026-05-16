import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AgoraRTC, {
	AgoraRTCProvider,
	useRTCClient,
	useLocalMicrophoneTrack,
	useLocalCameraTrack,
	usePublish,
	useJoin,
	useRemoteUsers,
	useRemoteAudioTracks,
	RemoteUser,
	LocalVideoTrack,
} from "agora-rtc-react";
import {
	Mic,
	MicOff,
	Video as VideoIcon,
	VideoOff,
	PhoneOff,
	Users,
	FileText,
	Clock,
	Wifi,
	ShieldCheck,
	Loader2,
	ChevronLeft,
	Send,
	MessageSquare,
	Maximize2,
	Minimize2,
	Sparkles,
	MonitorUp,
	Pin,
	PinOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import ConfirmModal from "@/components/ConfirmModal";
import { toast } from "react-toastify";
import axiosClient from "@/services/axiosClient";
import { useAuth } from "@/hooks/useAuth";
import { useSocket } from "@/contexts/SocketContext";

// Khởi tạo client WebRTC của Agora
const rtcClient = AgoraRTC.createClient({ codec: "vp8", mode: "rtc" });

export default function InterviewRoomPage() {
	const { interviewId } = useParams();
	const navigate = useNavigate();
	const { user } = useAuth();

	const [tokenInfo, setTokenInfo] = useState<any>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchToken = async () => {
			try {
				const res = await axiosClient.get(
					`/api/interviews/agora-token/${interviewId}`,
				);
				if (res.data.errCode === 0) {
					setTokenInfo(res.data.data);
				} else {
					setError(res.data.message || "Không thể tham gia phòng phỏng vấn");
					toast.error(
						res.data.message || "Không thể tham gia phòng phỏng vấn",
					);
				}
			} catch (err: any) {
				const msg =
					err.response?.data?.message || "Lỗi kết nối đến máy chủ Agora";
				setError(msg);
				toast.error(msg);
			} finally {
				setLoading(false);
			}
		};

		if (interviewId) {
			fetchToken();
		}
	}, [interviewId]);

	if (loading) {
		return (
			<div className="w-screen h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
				<div className="relative">
					<div className="w-24 h-24 rounded-full border-4 border-purple-500/20 border-t-purple-500 animate-spin" />
					<Sparkles className="w-8 h-8 text-purple-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
				</div>
				<h2 className="mt-6 text-2xl font-bold font-heading bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
					MNP Live Studio
				</h2>
				<p className="mt-2 text-slate-400 text-sm">
					Đang kết nối vào phòng phỏng vấn bảo mật...
				</p>
			</div>
		);
	}

	if (error || !tokenInfo) {
		return (
			<div className="w-screen h-screen bg-slate-950 flex flex-col items-center justify-center text-white p-4">
				<div className="w-16 h-16 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center mb-4 border border-red-500/30">
					<ShieldCheck className="w-8 h-8" />
				</div>
				<h2 className="text-2xl font-bold font-heading text-slate-100">
					Không thể truy cập phòng
				</h2>
				<p className="mt-2 text-slate-400 text-sm max-w-md text-center leading-relaxed">
					{error || "Bạn không có quyền hoặc phòng phỏng vấn không tồn tại."}
				</p>
				<Button
					onClick={() => navigate(-1)}
					className="mt-6 bg-purple-600 hover:bg-purple-700 text-white rounded-xl px-6 py-5 shadow-lg"
				>
					<ChevronLeft className="w-4 h-4 mr-2" /> Quay lại trang trước
				</Button>
			</div>
		);
	}

	return (
		<AgoraRTCProvider client={rtcClient}>
			<StudioContent tokenInfo={tokenInfo} />
		</AgoraRTCProvider>
	);
}

function StudioContent({ tokenInfo }: { tokenInfo: any }) {
	const navigate = useNavigate();
	const { user } = useAuth();
	const client = useRTCClient();
	const { socket } = useSocket();

	const [micOn, setMicOn] = useState(true);
	const [cameraOn, setCameraOn] = useState(true);
	const [activeSidebar, setActiveSidebar] = useState<"notes" | "chat" | null>(null);
	const [notes, setNotes] = useState("");
	const [duration, setDuration] = useState(0);
	const [isFullscreen, setIsFullscreen] = useState(false);

	const [messages, setMessages] = useState<any[]>([
		{
			id: "sys-1",
			message: "Chào mừng đến với MNP Live Studio. Kết nối của bạn đã được mã hóa đầu cuối.",
			senderName: "Hệ thống MNP",
			timestamp: new Date().toISOString(),
			isSystem: true,
		},
	]);
	const [inputMessage, setInputMessage] = useState("");
	const [screenSharing, setScreenSharing] = useState(false);
	const [screenTrack, setScreenTrack] = useState<any>(null);
	const [pinnedId, setPinnedId] = useState<string | number | null>(null);
	const [sharingUsers, setSharingUsers] = useState<Record<string | number, boolean>>({});
	const [mutedUsers, setMutedUsers] = useState<Record<string | number, boolean>>({});
	const [videoOffUsers, setVideoOffUsers] = useState<Record<string | number, boolean>>({});
	const [showLeaveModal, setShowLeaveModal] = useState(false);

	const autoPinnedSetRef = useRef<Set<string | number>>(new Set());

	// Client phụ chuyên trách phát luồng Screen Share
	const [screenClient] = useState(() => AgoraRTC.createClient({ codec: "vp8", mode: "rtc" }));

	// Agora Hooks cho client chính
	const { localMicrophoneTrack } = useLocalMicrophoneTrack(micOn);
	const { localCameraTrack } = useLocalCameraTrack(cameraOn);
	const rawRemoteUsers = useRemoteUsers();
	const { audioTracks } = useRemoteAudioTracks(rawRemoteUsers);

	const myScreenUid = Number(tokenInfo?.uid || 0) + 1000000;
	// Loại bỏ hoàn toàn luồng screen share của chính mình (myScreenUid) khỏi danh sách remote users
	const actualRemoteUsers = rawRemoteUsers.filter((u) => Number(u.uid) !== myScreenUid);

	// Hàm chuyển đổi sang luồng chia sẻ màn hình khác khi gỡ ghim hoặc khi một luồng share kết thúc
	const handleUnpin = (targetUnpinId: string | number | null = pinnedId) => {
		const activeScreens: Array<string | number> = [];
		if (screenSharing && screenTrack && targetUnpinId !== "local-screen") {
			activeScreens.push("local-screen");
		}
		actualRemoteUsers.forEach((u) => {
			if (Number(u.uid) > 1000000 && String(u.uid) !== String(targetUnpinId)) {
				activeScreens.push(u.uid);
			}
		});

		if (activeScreens.length > 0) {
			const nextScreen = activeScreens[activeScreens.length - 1];
			autoPinnedSetRef.current.add(String(nextScreen));
			setPinnedId(nextScreen);
		} else {
			setPinnedId(null);
		}
	};

	// Socket room chat & đồng bộ trạng thái mic/camera/screen share
	useEffect(() => {
		if (socket && tokenInfo?.interview?.id) {
			const roomId = `room_interview_${tokenInfo.interview.id}`;
			socket.emit("joinRoom", roomId);

			const handleReceiveMessage = (newMsg: any) => {
				setMessages((prev) => [...prev, newMsg]);
			};

			const handleScreenShareChanged = ({ userId, isSharing }: { userId: number | string; isSharing: boolean }) => {
				setSharingUsers((prev) => ({ ...prev, [userId]: isSharing }));
				if (String(userId) === String(myScreenUid) || userId === "local-screen") {
					return;
				}
				if (isSharing) {
					if (!autoPinnedSetRef.current.has(String(userId))) {
						autoPinnedSetRef.current.add(String(userId));
						setPinnedId(userId);
					}
				} else {
					autoPinnedSetRef.current.delete(String(userId));
					if (String(pinnedId) === String(userId)) {
						handleUnpin(userId);
					}
				}
			};

			const handleMicToggleChanged = ({ userId, muted }: { userId: number | string; muted: boolean }) => {
				setMutedUsers((prev) => ({ ...prev, [userId]: muted }));
			};

			const handleVideoToggleChanged = ({ userId, videoOff }: { userId: number | string; videoOff: boolean }) => {
				setVideoOffUsers((prev) => ({ ...prev, [userId]: videoOff }));
			};

			socket.on("room:receive-message", handleReceiveMessage);
			socket.on("room:screen-share-changed", handleScreenShareChanged);
			socket.on("room:mic-toggle-changed", handleMicToggleChanged);
			socket.on("room:video-toggle-changed", handleVideoToggleChanged);

			return () => {
				socket.off("room:receive-message", handleReceiveMessage);
				socket.off("room:screen-share-changed", handleScreenShareChanged);
				socket.off("room:mic-toggle-changed", handleMicToggleChanged);
				socket.off("room:video-toggle-changed", handleVideoToggleChanged);
			};
		}
	}, [socket, tokenInfo, myScreenUid, pinnedId, screenSharing, screenTrack, actualRemoteUsers]);

	// Tự động ghim khi có thành viên khác chia sẻ màn hình và xử lý chuyển đổi khi luồng ngắt
	useEffect(() => {
		const screenSharers = actualRemoteUsers.filter((u) => Number(u.uid) > 1000000);

		// Dọn dẹp set cho các luồng đã ngắt kết nối
		const currentScreenUids = new Set(screenSharers.map((u) => String(u.uid)));
		for (const uid of autoPinnedSetRef.current) {
			if (uid !== "local-screen" && !currentScreenUids.has(String(uid))) {
				autoPinnedSetRef.current.delete(uid);
			}
		}

		// 1. Kiểm tra nếu luồng đang ghim là một remote screen share nhưng nó không còn tồn tại
		if (pinnedId && String(pinnedId) !== "local-screen" && Number(pinnedId) > 1000000) {
			const stillExists = screenSharers.some((u) => String(u.uid) === String(pinnedId));
			if (!stillExists) {
				handleUnpin(pinnedId);
				return;
			}
		}

		// 2. Logic auto-pin khi có luồng share mới
		if (screenSharers.length > 0) {
			const latestSharer = screenSharers[screenSharers.length - 1];
			if (!autoPinnedSetRef.current.has(String(latestSharer.uid))) {
				autoPinnedSetRef.current.add(String(latestSharer.uid));
				setPinnedId(latestSharer.uid);
			}
		} else {
			if (pinnedId && String(pinnedId) !== "local-screen" && Number(pinnedId) > 1000000) {
				setPinnedId(null);
			}
		}
	}, [actualRemoteUsers, pinnedId, screenSharing, screenTrack]);

	// Xử lý bật/tắt Mic đồng bộ
	const toggleMic = () => {
		const nextState = !micOn;
		setMicOn(nextState);
		if (localMicrophoneTrack) {
			localMicrophoneTrack.setEnabled(nextState);
		}
		if (socket && tokenInfo?.interview?.id) {
			const roomId = `room_interview_${tokenInfo.interview.id}`;
			socket.emit("room:mic-toggle", { roomId, userId: tokenInfo.uid, muted: !nextState });
		}
	};

	// Xử lý bật/tắt Camera đồng bộ
	const toggleCamera = () => {
		const nextState = !cameraOn;
		setCameraOn(nextState);
		if (localCameraTrack) {
			localCameraTrack.setEnabled(nextState);
		}
		if (socket && tokenInfo?.interview?.id) {
			const roomId = `room_interview_${tokenInfo.interview.id}`;
			socket.emit("room:video-toggle", { roomId, userId: tokenInfo.uid, videoOff: !nextState });
		}
	};

	// Xử lý bật/tắt chia sẻ màn hình bằng Client phụ riêng biệt (Dual Client Architecture)
	const handleToggleScreenShare = async () => {
		const roomId = tokenInfo?.interview?.id ? `room_interview_${tokenInfo.interview.id}` : "";
		const screenUid = Number(tokenInfo.uid) + 1000000;

		if (screenSharing) {
			if (screenTrack) {
				try {
					await screenClient.unpublish(screenTrack);
				} catch (e) {}
				screenTrack.stop();
				screenTrack.close();
			}
			try {
				await screenClient.leave();
			} catch (e) {}
			setScreenTrack(null);
			setScreenSharing(false);

			if (socket && roomId) {
				socket.emit("room:screen-share", { roomId, userId: screenUid, isSharing: false });
			}
			if (pinnedId === "local-screen" || String(pinnedId) === String(screenUid)) {
				handleUnpin("local-screen");
			}
		} else {
			try {
				if (screenClient.connectionState === "DISCONNECTED") {
					await screenClient.join(tokenInfo.appId, tokenInfo.channelName, tokenInfo.token, screenUid);
				}

				const track = await AgoraRTC.createScreenVideoTrack(
					{ encoderConfig: "1080p_1", optimizationMode: "detail" },
					"disable"
				);

				setScreenTrack(track);
				setScreenSharing(true);
				setPinnedId("local-screen");
				await screenClient.publish(track);

				if (socket && roomId) {
					socket.emit("room:screen-share", { roomId, userId: screenUid, isSharing: true });
				}

				track.on("track-ended", async () => {
					track.stop();
					track.close();
					setScreenTrack(null);
					setScreenSharing(false);

					try {
						await screenClient.unpublish(track);
						await screenClient.leave();
					} catch (e) {}

					if (socket && roomId) {
						socket.emit("room:screen-share", { roomId, userId: screenUid, isSharing: false });
					}
					if (pinnedId === "local-screen" || String(pinnedId) === String(screenUid)) {
						handleUnpin("local-screen");
					}
				});
			} catch (err) {
				console.error("Lỗi chia sẻ màn hình:", err);
				setScreenSharing(false);
			}
		}
	};

	const handleSendMessage = () => {
		if (!inputMessage.trim() || !socket || !tokenInfo?.interview?.id) return;
		const roomId = `room_interview_${tokenInfo.interview.id}`;
		socket.emit("room:send-message", {
			roomId,
			message: inputMessage.trim(),
			senderName: user?.name || "Người tham gia",
			senderAvatar: user?.profilePicture || "",
			timestamp: new Date().toISOString(),
		});
		setInputMessage("");
	};

	// Tự động phát âm thanh của remote users
	useEffect(() => {
		audioTracks.forEach((track) => track.play());
	}, [audioTracks]);

	// Join channel trên Client chính
	useJoin(
		{
			appid: tokenInfo.appId,
			channel: tokenInfo.channelName,
			token: tokenInfo.token,
			uid: tokenInfo.uid,
		},
		true,
	);

	// Publish Mic và Camera trên Client chính (Camera luôn chạy song song, không bị thay thế khi share screen)
	usePublish(
		[
			localMicrophoneTrack,
			cameraOn ? localCameraTrack : null,
		].filter(Boolean) as any,
	);

	// Đếm thời gian cuộc gọi
	useEffect(() => {
		const timer = setInterval(() => {
			setDuration((prev) => prev + 1);
		}, 1000);
		return () => clearInterval(timer);
	}, []);

	// Xử lý tự động gia hạn token khi sắp hết hạn
	useEffect(() => {
		client.on("token-privilege-will-expire", async () => {
			try {
				const res = await axiosClient.get(
					`/api/interviews/agora-token/${tokenInfo.interview?.id}`,
				);
				if (res.data.errCode === 0 && res.data.data?.token) {
					await client.renewToken(res.data.data.token);
					toast.info("Đã tự động gia hạn phiên kết nối bảo mật.");
				}
			} catch (err) {
				console.error("Lỗi gia hạn token:", err);
			}
		});
	}, [client, tokenInfo]);

	const formatTime = (secs: number) => {
		const mins = Math.floor(secs / 60);
		const remSecs = secs % 60;
		return `${String(mins).padStart(2, "0")}:${String(remSecs).padStart(2, "0")}`;
	};

	const toggleFullscreen = () => {
		if (!document.fullscreenElement) {
			document.documentElement.requestFullscreen();
			setIsFullscreen(true);
		} else {
			if (document.exitFullscreen) {
				document.exitFullscreen();
				setIsFullscreen(false);
			}
		}
	};

	const handleLeave = () => {
		setShowLeaveModal(true);
	};

	const confirmLeave = async () => {
		setShowLeaveModal(false);
		if (document.fullscreenElement) {
			document.exitFullscreen();
		}
		if (screenSharing && screenTrack) {
			screenTrack.stop();
			screenTrack.close();
		}
		try {
			await screenClient.leave();
		} catch (e) {}
		navigate(-1);
	};

	const interview = tokenInfo?.interview;
	const isEmployer = user?.role === "EMPLOYER";
	const peerName = isEmployer
		? interview?.candidateName
		: interview?.employerName;
	const peerAvatar = isEmployer
		? interview?.candidateAvatar
		: interview?.employerAvatar;

	// Lọc ra các remote users là camera người tham gia (UID < 1000000)
	const participantRemotes = actualRemoteUsers.filter((u) => Number(u.uid) < 1000000);

	return (
		<div className="relative w-screen h-screen bg-slate-950 font-sans text-slate-100 flex flex-col overflow-hidden select-none">
			{/* Top Bar - Glassmorphism */}
			<header className="absolute top-0 left-0 right-0 h-20 bg-slate-900/60 backdrop-blur-xl border-b border-slate-800/80 px-6 flex items-center justify-between z-50">
				<div className="flex items-center gap-4">
					<div className="flex items-center gap-2.5">
						<div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
							<Sparkles className="w-5 h-5 text-white" />
						</div>
						<div className="flex flex-col">
							<div className="flex items-center gap-2">
								<span className="font-heading font-bold text-lg bg-gradient-to-r from-purple-400 to-pink-300 bg-clip-text text-transparent">
									MNP Live Studio
								</span>
								<Badge className="bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] px-2 py-0.5 rounded-full font-semibold">
									SECURED
								</Badge>
							</div>
							<span className="text-xs text-slate-400 truncate max-w-[280px]">
								{interview?.jobTitle || "Phòng phỏng vấn trực tuyến"}
							</span>
						</div>
					</div>
				</div>

				<div className="flex items-center gap-3 bg-slate-800/50 backdrop-blur-md px-4 py-2 rounded-2xl border border-slate-700/50 shadow-inner">
					<div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
					<span className="font-mono text-sm font-semibold tracking-wider text-emerald-400">
						{formatTime(duration)}
					</span>
					<div className="h-4 w-px bg-slate-700 mx-1" />
					<div className="flex items-center gap-1.5 text-xs text-slate-400">
						<Wifi className="w-3.5 h-3.5 text-emerald-400" />
						<span>Đường truyền ổn định</span>
					</div>
				</div>

				<div className="flex items-center gap-3">
					<Button
						variant="ghost"
						size="icon"
						onClick={toggleFullscreen}
						className="h-10 w-10 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
					>
						{isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
					</Button>
					<Button
						onClick={handleLeave}
						className="bg-red-600 hover:bg-red-700 text-white rounded-xl h-10 px-5 text-sm font-semibold shadow-lg shadow-red-600/20 transition-all hover:scale-105"
					>
						<PhoneOff className="w-4 h-4 mr-2" /> Rời phòng
					</Button>
				</div>
			</header>

			{/* Main Video Area */}
			<main className="flex-1 flex pt-20 pb-24 overflow-hidden relative">
				<div className="flex-1 h-full p-6 flex items-center justify-center relative overflow-hidden max-w-[100rem] mx-auto w-full">
					{pinnedId ? (
						/* --- BỐ CỤC CHUẨN GOOGLE MEET (Sân khấu lớn + Danh sách tham gia bên phải) --- */
						<div className="w-full h-full flex flex-col lg:flex-row gap-6 items-center justify-center">
							{/* Sân Khấu Chính (Màn hình được ghim) */}
							<div className="flex-1 w-full lg:w-3/4 h-full bg-slate-950 rounded-3xl overflow-hidden relative border border-slate-800 shadow-2xl flex flex-col items-center justify-center group">
								{pinnedId === "local-screen" ? (
									screenSharing && screenTrack ? (
										<LocalVideoTrack track={screenTrack} play={true} className="w-full h-full object-contain" />
									) : (
										<div className="text-slate-500 font-semibold text-lg">Đang kết nối luồng chia sẻ...</div>
									)
								) : pinnedId === "local" ? (
									cameraOn && localCameraTrack ? (
										<LocalVideoTrack track={localCameraTrack} play={true} className="w-full h-full object-cover transform -scale-x-100" />
									) : (
										<div className="flex flex-col items-center justify-center p-6 text-center">
											<Avatar className="w-28 h-28 text-3xl font-bold bg-slate-900 text-purple-400 mb-4 border-2 border-purple-500/50 shadow-xl">
												<AvatarImage src={user?.profilePicture || ""} />
												<AvatarFallback className="bg-slate-900 text-purple-400 font-extrabold text-4xl flex items-center justify-center w-full h-full">
													{user?.name?.charAt(0) || "ME"}
												</AvatarFallback>
											</Avatar>
											<span className="text-sm font-medium text-slate-400 flex items-center gap-2">
												<VideoOff className="w-4 h-4 text-purple-400" /> Camera đang tắt
											</span>
										</div>
									)
								) : (
									(() => {
										const pinnedUser = actualRemoteUsers.find((u) => String(u.uid) === String(pinnedId));
										if (pinnedUser) {
											const isScreenStream = Number(pinnedUser.uid) > 1000000;
											const isCamOff = !isScreenStream && (!pinnedUser.hasVideo || videoOffUsers[pinnedUser.uid]);
											if (isCamOff) {
												return (
													<div className="flex flex-col items-center justify-center p-6 text-center w-full h-full bg-slate-950">
														<Avatar className="w-28 h-28 text-3xl font-bold bg-slate-900 text-indigo-400 mb-4 border-2 border-indigo-500/50 shadow-xl">
															<AvatarImage src={peerAvatar || ""} />
															<AvatarFallback className="bg-slate-900 text-indigo-400 font-extrabold text-4xl flex items-center justify-center w-full h-full">
																{peerName?.charAt(0) || "P"}
															</AvatarFallback>
														</Avatar>
														<span className="text-sm font-medium text-slate-400 flex items-center gap-2">
															<VideoOff className="w-4 h-4 text-indigo-400" /> {peerName || "Đối tác"} đang tắt camera
														</span>
													</div>
												);
											}
											return <RemoteUser user={pinnedUser} playVideo={true} playAudio={!isScreenStream} className="w-full h-full object-contain" />;
										}
										return <div className="text-slate-500 font-semibold">Người dùng đã ngắt kết nối</div>;
									})()
								)}

								{/* Thanh thông tin & Nút bỏ ghim trên sân khấu */}
								<div className="absolute top-4 left-4 right-4 flex items-center justify-between p-4 bg-slate-950/70 backdrop-blur-md rounded-2xl border border-slate-800/80 z-10 shadow-xl">
									<div className="flex items-center gap-3">
										<Avatar className="w-10 h-10 border border-purple-500/50 shadow-lg">
											<AvatarImage src={pinnedId === "local-screen" || pinnedId === "local" ? user?.profilePicture : peerAvatar} />
											<AvatarFallback className="bg-purple-600 text-white font-bold">
												{pinnedId === "local-screen" || pinnedId === "local" ? user?.name?.charAt(0) : peerName?.charAt(0)}
											</AvatarFallback>
										</Avatar>
										<div>
											<div className="text-sm font-bold text-white flex items-center gap-2.5">
												{pinnedId === "local-screen" || pinnedId === "local" ? user?.name : peerName}
												{(pinnedId === "local-screen" || Number(pinnedId) > 1000000 || sharingUsers[String(pinnedId)]) && (
													<Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] px-2 py-0.5 rounded-full font-bold animate-pulse">
														Đang trình bày
													</Badge>
												)}
											</div>
											<div className="text-xs text-slate-400 font-medium mt-0.5">
												{pinnedId === "local-screen" ? "Màn hình chia sẻ của bạn" : pinnedId === "local" ? "Bạn (Màn hình chính)" : "Đối tác"}
											</div>
										</div>
									</div>
									<Button
										variant="ghost"
										size="sm"
										onClick={() => handleUnpin(pinnedId)}
										className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl h-9 px-3.5 text-xs font-bold shadow-lg transition-all"
									>
										<PinOff className="w-3.5 h-3.5 mr-1.5" /> Bỏ ghim
									</Button>
								</div>
							</div>

							{/* Cột Danh sách Thành viên (Thanh bên phải - Hiển thị song song Camera của bạn và những người khác) */}
							<div className="w-full lg:w-1/4 lg:max-w-xs h-full flex flex-row lg:flex-col gap-4 overflow-x-auto lg:overflow-y-auto pr-2 pb-2">
								{/* Camera Local (Luôn hiển thị song song với màn hình chia sẻ) */}
								<div
									className={`relative rounded-3xl overflow-hidden bg-slate-900 border ${
										pinnedId === "local" ? "border-purple-500 ring-2 ring-purple-500/30" : "border-slate-800 shadow-xl"
									} shrink-0 h-44 lg:h-52 group flex flex-col items-center justify-center transition-all`}
								>
									{pinnedId === "local" ? (
										<div className="w-full h-full flex flex-col items-center justify-center bg-slate-950 p-4 text-center">
											<VideoIcon className="w-8 h-8 mb-2 text-purple-400 animate-pulse" />
											<span className="text-xs font-semibold text-purple-300">Đang hiển thị trên sân khấu</span>
										</div>
									) : cameraOn && localCameraTrack ? (
										<LocalVideoTrack track={localCameraTrack} play={true} className="w-full h-full object-cover transform -scale-x-100" />
									) : (
										<Avatar className="w-16 h-16 border border-purple-500/50 shadow-lg">
											<AvatarImage src={user?.profilePicture} />
											<AvatarFallback className="bg-slate-900 text-purple-400 font-bold text-2xl">
												{user?.name?.charAt(0)}
											</AvatarFallback>
										</Avatar>
									)}
									<div className="absolute bottom-3 left-3 right-3 flex items-center justify-between p-2.5 bg-slate-950/80 backdrop-blur-md rounded-xl border border-slate-800/80 z-10 text-xs">
										<span className="text-white font-semibold truncate max-w-[130px]">
											{user?.name} (Bạn)
										</span>
										<div className="flex items-center gap-1.5">
											{!micOn && <MicOff className="w-3.5 h-3.5 text-red-400" />}
											<Button
												size="icon"
												variant="ghost"
												onClick={() => {
													if (pinnedId === "local") handleUnpin("local");
													else setPinnedId("local");
												}}
												className={`w-7 h-7 rounded-lg transition-all ${
													pinnedId === "local" ? "bg-purple-600 text-white shadow-md" : "bg-slate-800 text-slate-300 hover:text-white"
												}`}
												title={pinnedId === "local" ? "Bỏ ghim" : "Ghim lên chính"}
											>
												<Pin className={`w-3.5 h-3.5 ${pinnedId === "local" ? "fill-white" : ""}`} />
											</Button>
										</div>
									</div>
								</div>

								{/* Màn hình chia sẻ Local thu nhỏ (nếu đang share nhưng lại ghim camera của ai đó) */}
								{screenSharing && screenTrack && pinnedId !== "local-screen" && (
									<div
										className="relative rounded-3xl overflow-hidden bg-slate-950 border-2 border-emerald-500 shadow-xl shadow-emerald-500/10 shrink-0 h-44 lg:h-52 group flex flex-col items-center justify-center transition-all"
									>
										<LocalVideoTrack track={screenTrack} play={true} className="w-full h-full object-cover" />
										<div className="absolute bottom-3 left-3 right-3 flex items-center justify-between p-2.5 bg-slate-950/90 backdrop-blur-md rounded-xl border border-emerald-500/30 z-10 text-xs">
											<span className="text-emerald-400 font-bold truncate max-w-[130px]">
												Màn hình của bạn
											</span>
											<Button
												size="icon"
												variant="ghost"
												onClick={() => setPinnedId("local-screen")}
												className="w-7 h-7 rounded-lg bg-emerald-600 text-white shadow-md"
												title="Ghim màn hình share lên chính"
											>
												<Pin className="w-3.5 h-3.5" />
											</Button>
										</div>
									</div>
								)}

								{/* Thumbnail Remote Users (Bao gồm camera và màn hình chia sẻ của người khác) */}
								{actualRemoteUsers.map((remoteUser) => {
									const isPeerScreen = Number(remoteUser.uid) > 1000000;
									const isPinned = String(pinnedId) === String(remoteUser.uid);
									const isCamOff = !isPeerScreen && (!remoteUser.hasVideo || videoOffUsers[remoteUser.uid]);
									const isMicOff = !isPeerScreen && (!remoteUser.hasAudio || mutedUsers[remoteUser.uid]);

									return (
										<div
											key={remoteUser.uid}
											className={`relative rounded-3xl overflow-hidden ${
												isPeerScreen ? "bg-slate-950 border-2 border-indigo-500 shadow-indigo-500/10" : "bg-slate-900 border-slate-800 shadow-xl"
											} ${isPinned ? "ring-2 ring-purple-500/30" : ""} shrink-0 h-44 lg:h-52 group flex flex-col items-center justify-center transition-all`}
										>
											{isPinned ? (
												<div className="w-full h-full flex flex-col items-center justify-center bg-slate-950 p-4 text-center">
													<MonitorUp className="w-8 h-8 mb-2 text-purple-400 animate-pulse" />
													<span className="text-xs font-semibold text-purple-300">Đang hiển thị trên sân khấu</span>
												</div>
											) : isCamOff ? (
												<div className="w-full h-full flex flex-col items-center justify-center bg-slate-950 p-4 text-center">
													<Avatar className="w-16 h-16 border border-indigo-500/50 shadow-lg">
														<AvatarImage src={peerAvatar || ""} />
														<AvatarFallback className="bg-slate-900 text-indigo-400 font-bold text-2xl">
															{peerName?.charAt(0) || "P"}
														</AvatarFallback>
													</Avatar>
												</div>
											) : (
												<RemoteUser user={remoteUser} playVideo={true} playAudio={!isPeerScreen} className="w-full h-full object-cover" />
											)}
											<div className="absolute bottom-3 left-3 right-3 flex items-center justify-between p-2.5 bg-slate-950/80 backdrop-blur-md rounded-xl border border-slate-800/80 z-10 text-xs">
												<span className="text-white font-semibold truncate max-w-[130px]">
													{peerName || "Đối tác"} {isPeerScreen ? <span className="text-indigo-400 text-[10px] ml-1">(Share)</span> : sharingUsers[String(remoteUser.uid)] && <span className="text-emerald-400 text-[10px] ml-1">(Share)</span>}
												</span>
												<div className="flex items-center gap-1.5">
													{isMicOff && <MicOff className="w-3.5 h-3.5 text-red-400" />}
													<Button
														size="icon"
														variant="ghost"
														onClick={() => {
															if (isPinned) handleUnpin(remoteUser.uid);
															else setPinnedId(remoteUser.uid);
														}}
														className={`w-7 h-7 rounded-lg transition-all ${
															isPinned ? "bg-purple-600 text-white shadow-md" : "bg-slate-800 text-slate-300 hover:text-white"
														}`}
														title={isPinned ? "Bỏ ghim" : "Ghim lên chính"}
													>
														<Pin className={`w-3.5 h-3.5 ${isPinned ? "fill-white" : ""}`} />
													</Button>
												</div>
											</div>
										</div>
									);
								})}
							</div>
						</div>
					) : (
						/* --- LAYOUT LƯỚI CÂN BẰNG (Khi không ai được ghim và không ai share screen) --- */
						<div
							className={`w-full h-full max-w-7xl max-h-[80vh] grid gap-6 transition-all duration-500 items-center justify-center mx-auto ${
								participantRemotes.length === 0 ? "grid-cols-1 max-w-4xl" : "grid-cols-1 md:grid-cols-2"
							}`}
						>
							{/* Local Video Card */}
							<div className="relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl flex flex-col items-center justify-center group aspect-video min-h-[300px]">
								{cameraOn && localCameraTrack ? (
									<LocalVideoTrack track={localCameraTrack} play={true} className="w-full h-full object-cover transform -scale-x-100" />
								) : (
									<div className="flex flex-col items-center justify-center text-center p-6">
										<div className="w-28 h-28 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 p-1 mb-4 shadow-xl shadow-purple-500/20">
											<Avatar className="w-full h-full text-3xl font-bold bg-slate-900 text-purple-400 overflow-hidden rounded-full">
												<AvatarImage src={user?.profilePicture || ""} />
												<AvatarFallback className="bg-slate-900 text-purple-400 font-extrabold text-4xl shadow-inner flex items-center justify-center w-full h-full">
													{user?.name?.charAt(0) || "ME"}
												</AvatarFallback>
											</Avatar>
										</div>
										<span className="text-slate-400 font-medium text-sm flex items-center gap-2">
											<VideoOff className="w-4 h-4 text-purple-400" /> Camera đang tắt
										</span>
									</div>
								)}

								<div className="absolute bottom-4 left-4 right-4 flex items-center justify-between p-3 bg-slate-950/70 backdrop-blur-md rounded-2xl border border-slate-800/80 z-10">
									<div className="flex items-center gap-2.5">
										<Avatar className="w-8 h-8 border border-purple-500/50">
											<AvatarImage src={user?.profilePicture || ""} />
											<AvatarFallback className="bg-purple-600 text-xs text-white">
												{user?.name?.charAt(0) || "U"}
											</AvatarFallback>
										</Avatar>
										<span className="text-sm font-semibold text-white flex items-center gap-2">
											{user?.name || "Bạn"} ({isEmployer ? "Nhà tuyển dụng" : "Ứng viên"})
										</span>
									</div>
									<div className="flex items-center gap-2">
										{!micOn && (
											<div className="h-7 w-7 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30 flex items-center justify-center">
												<MicOff className="w-3.5 h-3.5" />
											</div>
										)}
										<Button
											size="sm"
											variant="ghost"
											onClick={() => setPinnedId("local")}
											className="h-8 px-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold gap-1 shadow-md transition-all"
										>
											<Pin className="w-3.5 h-3.5" /> Ghim
										</Button>
									</div>
								</div>
							</div>

							{/* Remote Participant Cards */}
							{participantRemotes.map((remoteUser) => {
								const isCamOff = !remoteUser.hasVideo || videoOffUsers[remoteUser.uid];
								const isMicOff = !remoteUser.hasAudio || mutedUsers[remoteUser.uid];

								return (
									<div
										key={remoteUser.uid}
										className="relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl flex flex-col items-center justify-center group aspect-video min-h-[300px]"
									>
										{isCamOff ? (
											<div className="flex flex-col items-center justify-center p-6 text-center w-full h-full bg-slate-950">
												<Avatar className="w-28 h-28 text-3xl font-bold bg-slate-900 text-indigo-400 mb-4 border-2 border-indigo-500/50 shadow-xl">
													<AvatarImage src={peerAvatar || ""} />
													<AvatarFallback className="bg-slate-900 text-indigo-400 font-extrabold text-4xl flex items-center justify-center w-full h-full">
														{peerName?.charAt(0) || "P"}
													</AvatarFallback>
												</Avatar>
												<span className="text-sm font-medium text-slate-400 flex items-center gap-2">
													<VideoOff className="w-4 h-4 text-indigo-400" /> {peerName || "Người tham gia"} đang tắt camera
												</span>
											</div>
										) : (
											<RemoteUser user={remoteUser} playVideo={true} playAudio={true} className="w-full h-full object-cover" />
										)}

										<div className="absolute bottom-4 left-4 right-4 flex items-center justify-between p-3 bg-slate-950/70 backdrop-blur-md rounded-2xl border border-slate-800/80 z-10">
											<div className="flex items-center gap-2.5">
												<Avatar className="w-8 h-8 border border-indigo-500/50">
													<AvatarImage src={peerAvatar || ""} />
													<AvatarFallback className="bg-indigo-600 text-xs text-white">
														{peerName?.charAt(0) || "P"}
													</AvatarFallback>
												</Avatar>
												<span className="text-sm font-semibold text-white flex items-center gap-2">
													{peerName || "Người tham gia"}
												</span>
											</div>
											<div className="flex items-center gap-2">
												{isMicOff && (
													<div className="h-7 w-7 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30 flex items-center justify-center">
														<MicOff className="w-3.5 h-3.5" />
													</div>
												)}
												<Button
													size="sm"
													variant="ghost"
													onClick={() => setPinnedId(remoteUser.uid)}
													className="h-8 px-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold gap-1 shadow-md transition-all"
												>
													<Pin className="w-3.5 h-3.5" /> Ghim
												</Button>
											</div>
										</div>
									</div>
								);
							})}
						</div>
					)}
				</div>

				{/* Sidebar (Notes / Chat) - Glassmorphism */}
				{activeSidebar && (
					<aside className="w-80 h-full border-l border-slate-800/80 bg-slate-900/60 backdrop-blur-2xl flex flex-col shadow-2xl z-40 transition-all duration-300">
						<div className="p-4 border-b border-slate-800 flex items-center justify-between">
							<h3 className="font-heading font-bold text-white flex items-center gap-2 text-sm">
								{activeSidebar === "notes" ? (
									<>
										<FileText className="w-4 h-4 text-purple-400" /> Ghi chú phỏng vấn
									</>
								) : (
									<>
										<MessageSquare className="w-4 h-4 text-pink-400" /> Tin nhắn phòng
									</>
								)}
							</h3>
							<Button
								variant="ghost"
								size="icon"
								className="h-8 w-8 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"
								onClick={() => setActiveSidebar(null)}
							>
								<ChevronLeft className="w-4 h-4 rotate-180" />
							</Button>
						</div>

						<div className="flex-1 p-4 overflow-y-auto">
							{activeSidebar === "notes" ? (
								<div className="flex flex-col h-full gap-3">
									<p className="text-xs text-slate-400 leading-relaxed">
										Ghi chú này giúp bạn ghi nhớ nhanh các điểm quan trọng trong buổi phỏng vấn.
									</p>
									<textarea
										value={notes}
										onChange={(e) => setNotes(e.target.value)}
										placeholder="Nhập ghi chú tại đây..."
										className="flex-1 w-full bg-slate-950/80 border border-slate-800 rounded-2xl p-4 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-purple-500 resize-none transition-all shadow-inner"
									/>
								</div>
							) : (
								<div className="flex flex-col h-full justify-between gap-4">
									<div className="flex flex-col gap-3 text-sm overflow-y-auto pr-1">
										{messages.map((msg) => {
											const isMe = msg.senderId === user?.id;
											if (msg.isSystem) {
												return (
													<div
														key={msg.id}
														className="bg-slate-800/60 rounded-2xl p-3 border border-slate-700/50 max-w-[85%] self-start"
													>
														<span className="text-xs text-purple-400 font-semibold block mb-1">
															{msg.senderName}
														</span>
														<p className="text-slate-300 text-xs leading-relaxed">
															{msg.message}
														</p>
													</div>
												);
											}
											return (
												<div
													key={msg.id}
													className={`flex flex-col gap-1 max-w-[85%] ${
														isMe ? "self-end items-end" : "self-start items-start"
													}`}
												>
													<span className="text-[10px] text-slate-400 font-medium px-1">
														{isMe ? "Bạn" : msg.senderName}
													</span>
													<div
														className={`rounded-2xl p-3 text-xs leading-relaxed ${
															isMe
																? "bg-purple-600 text-white rounded-br-sm shadow-md shadow-purple-600/20"
																: "bg-slate-800 text-slate-200 border border-slate-700/50 rounded-bl-sm"
														}`}
													>
														{msg.message}
													</div>
												</div>
											);
										})}
									</div>
									<div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
										<Input
											value={inputMessage}
											onChange={(e) => setInputMessage(e.target.value)}
											onKeyDown={(e) => {
												if (e.key === "Enter") handleSendMessage();
											}}
											placeholder="Nhập tin nhắn..."
											className="bg-slate-950 border-slate-800 text-sm rounded-xl focus-visible:ring-purple-500 text-slate-200"
										/>
										<Button
											onClick={handleSendMessage}
											size="icon"
											className="bg-purple-600 hover:bg-purple-700 rounded-xl shrink-0 shadow-md shadow-purple-600/20"
										>
											<Send className="w-4 h-4" />
										</Button>
									</div>
								</div>
							)}
						</div>
					</aside>
				)}
			</main>

			{/* Control Dock (Bottom Bar) - Glassmorphism */}
			<footer className="absolute bottom-6 left-1/2 -translate-x-1/2 h-16 bg-slate-900/80 backdrop-blur-2xl border border-slate-800/80 rounded-3xl px-6 flex items-center gap-4 shadow-2xl shadow-purple-950/50 z-50">
				{/* Mic Toggle */}
				<Button
					size="icon"
					onClick={toggleMic}
					className={`h-12 w-12 rounded-2xl transition-all duration-300 ${
						micOn
							? "bg-slate-800 hover:bg-slate-700 text-white"
							: "bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/20"
					}`}
				>
					{micOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
				</Button>

				{/* Camera Toggle */}
				<Button
					size="icon"
					onClick={toggleCamera}
					className={`h-12 w-12 rounded-2xl transition-all duration-300 ${
						cameraOn
							? "bg-slate-800 hover:bg-slate-700 text-white"
							: "bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/20"
					}`}
				>
					{cameraOn ? (
						<VideoIcon className="w-5 h-5" />
					) : (
						<VideoOff className="w-5 h-5" />
					)}
				</Button>

				{/* Screen Share Toggle */}
				<Button
					onClick={handleToggleScreenShare}
					className={`h-12 px-4 rounded-2xl font-semibold text-sm transition-all duration-300 flex items-center gap-2 ${
						screenSharing
							? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20 animate-pulse"
							: "bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/50"
					}`}
				>
					<MonitorUp className="w-4 h-4" />
					<span className="hidden sm:inline">
						{screenSharing ? "Dừng chia sẻ" : "Chia sẻ màn hình"}
					</span>
				</Button>

				<div className="h-6 w-px bg-slate-800 mx-1" />

				{/* Notes Panel Toggle */}
				<Button
					onClick={() => setActiveSidebar(activeSidebar === "notes" ? null : "notes")}
					className={`h-12 px-4 rounded-2xl font-semibold text-sm transition-all duration-300 flex items-center gap-2 ${
						activeSidebar === "notes"
							? "bg-purple-600 text-white shadow-lg shadow-purple-600/20"
							: "bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/50"
					}`}
				>
					<FileText className="w-4 h-4" /> Ghi chú
				</Button>

				{/* Chat Panel Toggle */}
				<Button
					onClick={() => setActiveSidebar(activeSidebar === "chat" ? null : "chat")}
					className={`h-12 px-4 rounded-2xl font-semibold text-sm transition-all duration-300 flex items-center gap-2 ${
						activeSidebar === "chat"
							? "bg-pink-600 text-white shadow-lg shadow-pink-600/20"
							: "bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/50"
					}`}
				>
					<MessageSquare className="w-4 h-4" /> Tin nhắn
				</Button>
			</footer>

			{/* Leave Confirmation Modal */}
			<ConfirmModal
				isOpen={showLeaveModal}
				onClose={() => setShowLeaveModal(false)}
				onConfirm={confirmLeave}
				title="Xác nhận rời phòng"
				description="Bạn có chắc chắn muốn rời khỏi phòng phỏng vấn trực tuyến? Cuộc gọi sẽ kết thúc đối với bạn."
				confirmText="Xác nhận rời"
				cancelText="Ở lại"
			/>
		</div>
	);
}
