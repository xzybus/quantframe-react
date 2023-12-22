import { Group, Title, rem, Text } from "@mantine/core";
import { useAppContext } from "../contexts";

export function Logo({ color, width, id }: { color: string, id?: string, width?: number }) {
	const { app_info } = useAppContext();
	return (
		<Group spacing={"xs"} id={id}>
			<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" width={rem(width ?? 40)} fill={color}
				viewBox="0 0 382.36 370.14" >
				<g>
					<path d="M192.17,3.49c1.8,2.69,3.38,5.08,4.99,7.45c6.13,9.02,11.73,18.45,18.51,26.96c14.43,18.12,34.33,29.86,52.6,43.46
		c3.02,2.25,6.42,4.08,9.04,6.71c1.67,1.69,3.23,4.56,3.1,6.79c-0.61,10.14-1.08,20.39-3.05,30.31
		c-2.47,12.49-7.01,24.43-15.25,34.77c1.22-3.56,2.42-7.13,3.67-10.68c3.2-9.1,3.21-18.37,1.48-27.73
		c-1.2-6.49-5.63-10.98-10.46-14.53c-19.65-14.45-39.54-28.59-59.59-42.48c-2.06-1.43-6.2-1.38-8.68-0.35
		c-4.32,1.81-8.22,4.73-12.06,7.52c-10.52,7.65-20.93,15.44-31.35,23.23c-6.02,4.5-12.4,8.64-17.83,13.78
		c-9.1,8.61-12.24,19.73-9.64,31.84c1.72,8.02,5,15.7,7.26,23.91c-1.54-2.46-3.33-4.81-4.58-7.41c-5.99-12.44-12.99-24.58-15-38.48
		c-1.2-8.28-1.46-16.73-1.46-25.11c0-2.16,2.32-4.53,3.99-6.45c7.41-8.5,16.89-14.31,26.22-20.44
		c23.96-15.73,42.74-36.42,56.77-61.43C191.08,4.71,191.46,4.37,192.17,3.49z"/>
					<path d="M233.03,253.66c4.29,7.84,5.28,16.33,4.52,24.96c-0.39,4.33-1.68,8.64-3.05,12.79c-0.42,1.28-2.39,2.1-3.74,3
		c-1.18,0.78-2.7,1.14-3.69,2.09c-4.21,4.02-8.33,8.13-12.35,12.34c-0.94,0.98-1.28,2.52-2.02,3.72c-0.78,1.26-1.45,3.04-2.62,3.55
		c-11.86,5.18-23.77,5.12-35.58-0.24c-1.01-0.46-2.54-1.19-2.67-1.98c-1.41-9.06-8.89-14.48-15.13-17.97
		c-12.31-6.88-9.74-17.34-9.95-27.38c-0.07-3.39,2.1-6.8,3.06-10.26c0.9-3.21,1.99-5.87,6.19-5.25c0.74,0.11,1.79-0.74,2.45-1.39
		c3.81-3.72,7.56-7.49,11.28-11.29c0.66-0.67,1.62-1.66,1.52-2.38c-0.76-5.44,3.37-5.88,6.88-7.15c10.72-3.88,21.24-3.75,31.55,1.36
		c1.01,0.5,2.68,1.15,2.74,1.84c0.64,7.7,7.84,10.24,11.91,15.17c1.91,2.31,5.08,3.57,7.68,5.3
		C232.35,254.21,232.69,253.93,233.03,253.66z"/>
					<path d="M193.13,385.25c-56.85,0-113.71,0-170.56,0c-6.37,0-10.89-2.68-10.73-6.35c0.16-3.54,4.5-6.04,10.54-6.04
		c113.71,0,227.42,0,341.12,0c6.37,0,10.9,2.68,10.73,6.34c-0.17,3.55-4.5,6.04-10.54,6.04
		C306.84,385.26,249.99,385.25,193.13,385.25z"/>
					<path d="M193.61,352.9c47.71,0,95.41,0,143.12,0c6.03,0,10.39,2.49,10.56,6.02c0.18,3.66-4.37,6.37-10.71,6.37
		c-95.74,0-191.49,0-287.23,0c-6.04,0-10.37-2.48-10.55-6.02c-0.19-3.67,4.34-6.37,10.71-6.37
		C97.54,352.9,145.58,352.9,193.61,352.9z"/>
					<path d="M5.37,130.38c5.1-1.08,9.38-1.87,13.61-2.9c15.02-3.63,28.46-10.75,41.36-19c3.98-2.55,7.89-5.21,11.93-7.68
		c3.41-2.09,5.62-1.22,6.42,2.69c1.43,7.02,2.69,14.09,3.76,21.18c0.14,0.96-1.02,2.53-2,3.18c-9.14,6.04-18.45,11.83-27.56,17.92
		c-7.44,4.97-8.22,6.46-4.84,14.52c9.25,22.02,18.09,44.33,32.04,63.96c4.9,6.9,10.95,12.99,17.22,20.32
		c-11.58-0.96-22.3-1.86-28.51-11.87c-6.36-10.24-11.71-21.12-17.37-31.79c-5.44-10.26-10.36-20.82-16.17-30.87
		c-5.39-9.33-11.37-18.36-17.65-27.12C14.49,138.57,10.1,135.15,5.37,130.38z"/>
					<path d="M378.14,129.42c-9.04,12.39-18.57,24.15-26.59,36.86c-7.16,11.35-12.65,23.75-18.86,35.69
		c-4.62,8.89-9.22,17.78-13.8,26.68c-4.88,9.47-12.79,14.14-23.27,14.9c-2.24,0.16-4.46,0.68-7.54,1.16
		c4.76-5.81,9.04-10.9,13.17-16.1c10.19-12.83,17.26-27.43,23.92-42.28c4.36-9.72,8.81-19.41,13.49-28.98
		c1.38-2.82,1.58-4.83-1.09-6.76c-9.96-7.19-19.7-14.72-29.95-21.47c-3.88-2.56-4.95-4.74-3.56-9c1.66-5.11,2.7-10.43,4.16-15.62
		c0.92-3.29,2.7-4.06,5.85-2.04c8.97,5.73,17.89,11.58,27.18,16.74C352.83,125.67,365.54,128.69,378.14,129.42z"/>
					<path d="M193.06,332.94c36.73,0,73.46,0,110.18,0c5.6,0,9.9,2.55,10.11,5.96c0.22,3.56-4.28,6.42-10.16,6.42
		c-73.79,0-147.58,0-221.36,0c-5.61,0-9.88-2.54-10.1-5.97c-0.23-3.56,4.28-6.42,10.15-6.42C118.94,332.94,156,332.94,193.06,332.94
		z"/>
					<path d="M211.72,108.82c-1,3.34-1.88,6.28-2.55,8.53c-6.32-0.58-12.25-1.61-18.14-1.41c-2.4,0.08-5.83,2.35-6.73,4.49
		c-0.77,1.82,0.77,5.55,2.47,7.23c2.22,2.19,5.56,3.32,8.52,4.68c6.73,3.09,13.63,5.84,17.38,12.97c4.92,9.34,0.91,20.54-9.87,25.13
		c-4.69,2-6.99,4.21-6.3,9.39c0.47,3.52-1.36,4.81-5.01,4.82c-3.73,0.01-5.37-1.45-4.97-4.9c0.59-5-1.9-6.54-6.4-7.16
		c-10.22-1.39-11.05-2.95-7.95-13.31c4.84,1.19,9.69,2.45,14.57,3.58c7.73,1.79,14.64-2.91,13.37-9.6
		c-0.48-2.55-3.13-5.28-5.52-6.74c-5-3.06-10.55-5.23-15.77-7.95c-12.63-6.59-11.13-24.36,1.79-30.54c4.81-2.3,7.58-4.42,7.02-10.06
		c-0.1-0.98,2.58-2.92,4.2-3.23c2.1-0.4,5.21-0.26,4.82,3.22c-0.61,5.41,1.69,7.33,6.91,7.69
		C206.33,105.85,208.98,107.7,211.72,108.82z"/>
					<path d="M120.91,225.99c-8.41,1.17-17.51-3.98-21.71-12.04c-7.04-13.51-14.54-26.79-22.01-40.07c-2.16-3.83-4.91-7.33-7.66-11.37
		c1.66-0.8,3.04-1.69,4.55-2.15c5.61-1.68,11.27-3.15,16.88-4.81c3.99-1.18,6.84,0.87,10.02,6.88c2.03,3.84-1.17,4.43-3.18,5.81
		c-8.01,5.49-8.1,5.6-3.58,14.7C101.71,198.03,108.67,213.46,120.91,225.99z"/>
					<path d="M316.32,162.32c-4.13,5.83-8.75,11.54-12.49,17.78c-7.31,12.2-14.45,24.54-21.03,37.15c-3.44,6.59-9.71,5.97-15.8,7.54
		c1-1.93,1.92-3.9,3.01-5.78c7.87-13.59,15.65-27.22,23.73-40.68c2.19-3.65,1.16-5.66-2.04-7.46c-2.56-1.44-5.13-2.89-8.66-4.89
		c2.23-3.21,4.33-6.5,6.76-9.52c0.58-0.72,2.41-0.98,3.46-0.69C300.92,157.82,308.52,160.08,316.32,162.32z"/>
				</g>
			</svg>
			<Title order={4} style={{ color: color }}>{app_info?.app_name}</Title>
			<Text size={"sm"} style={{ color: color }}>v{app_info?.app_version.current_version}</Text>
		</Group>
	);
}