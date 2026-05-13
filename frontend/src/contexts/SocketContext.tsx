import React, {
	createContext,
	useContext,
	useEffect,
	useState,
	ReactNode,
} from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "@/hooks/useAuth";

interface SocketContextType {
	socket: Socket | null;
	isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
	socket: null,
	isConnected: false,
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }: { children: ReactNode }) => {
	const { user } = useAuth();
	const [socket, setSocket] = useState<Socket | null>(null);
	const [isConnected, setIsConnected] = useState(false);

	useEffect(() => {
		if (user) {
			const newSocket = io(
				import.meta.env.VITE_API_BASE_URL || "http://localhost:8081",
				{
					withCredentials: true,
					auth: {
						token: user.token,
					},
				},
			);

			newSocket.on("connect", () => {
				console.log("Socket connected:", newSocket.id);
				setIsConnected(true);
			});

			newSocket.on("disconnect", () => {
				console.log("Socket disconnected");
				setIsConnected(false);
			});

			setSocket(newSocket);

			return () => {
				newSocket.disconnect();
			};
		} else {
			if (socket) {
				socket.disconnect();
				setSocket(null);
				setIsConnected(false);
			}
		}
	}, [user]);

	return (
		<SocketContext.Provider value={{ socket, isConnected }}>
			{children}
		</SocketContext.Provider>
	);
};
