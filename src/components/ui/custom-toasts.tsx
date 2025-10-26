import { AlertCircle, CheckCircle, Info, XCircle } from "lucide-react";

interface ToastProps {
	title: string;
	message?: string;
}

export const SuccessToast = ({ title, message }: ToastProps) => (
	<div className="flex items-start gap-3 rounded-xl border border-purple-500/50 bg-gradient-to-r from-purple-500/20 to-pink-500/20 p-4 backdrop-blur-sm">
		<CheckCircle className="h-6 w-6 shrink-0 text-purple-400" />
		<div className="flex-1">
			<h4 className="mb-0.5 font-semibold text-white">{title}</h4>
			{message && <p className="text-gray-300 text-sm">{message}</p>}
		</div>
	</div>
);

export const ErrorToast = ({ title, message }: ToastProps) => (
	<div className="flex items-start gap-3 rounded-xl border border-red-500/50 bg-red-500/20 p-4 backdrop-blur-sm">
		<XCircle className="h-6 w-6 shrink-0 text-red-400" />
		<div className="flex-1">
			<h4 className="mb-0.5 font-semibold text-white">{title}</h4>
			{message && <p className="text-red-200 text-sm">{message}</p>}
		</div>
	</div>
);

export const WarningToast = ({ title, message }: ToastProps) => (
	<div className="flex items-start gap-3 rounded-xl border border-yellow-500/50 bg-yellow-500/20 p-4 backdrop-blur-sm">
		<AlertCircle className="h-6 w-6 shrink-0 text-yellow-400" />
		<div className="flex-1">
			<h4 className="mb-0.5 font-semibold text-white">{title}</h4>
			{message && <p className="text-sm text-yellow-200">{message}</p>}
		</div>
	</div>
);

export const InfoToast = ({ title, message }: ToastProps) => (
	<div className="flex items-start gap-3 rounded-xl border border-blue-500/50 bg-blue-500/20 p-4 backdrop-blur-sm">
		<Info className="h-6 w-6 shrink-0 text-blue-400" />
		<div className="flex-1">
			<h4 className="mb-0.5 font-semibold text-white">{title}</h4>
			{message && <p className="text-blue-200 text-sm">{message}</p>}
		</div>
	</div>
);
