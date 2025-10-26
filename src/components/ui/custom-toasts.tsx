import { AlertCircle, CheckCircle, Info, XCircle } from "lucide-react";

interface ToastProps {
	title: string;
	message?: string;
}

export const SuccessToast = ({ title, message }: ToastProps) => (
	<div className="flex items-start gap-3 rounded-xl border border-green-200 bg-white p-4 shadow-lg">
		<CheckCircle className="h-6 w-6 shrink-0 text-green-600" />
		<div className="flex-1">
			<h4 className="mb-0.5 font-semibold text-gray-900">{title}</h4>
			{message && <p className="text-gray-600 text-sm">{message}</p>}
		</div>
	</div>
);

export const ErrorToast = ({ title, message }: ToastProps) => (
	<div className="flex items-start gap-3 rounded-xl border border-red-200 bg-white p-4 shadow-lg">
		<XCircle className="h-6 w-6 shrink-0 text-red-600" />
		<div className="flex-1">
			<h4 className="mb-0.5 font-semibold text-gray-900">{title}</h4>
			{message && <p className="text-gray-600 text-sm">{message}</p>}
		</div>
	</div>
);

export const WarningToast = ({ title, message }: ToastProps) => (
	<div className="flex items-start gap-3 rounded-xl border border-yellow-200 bg-white p-4 shadow-lg">
		<AlertCircle className="h-6 w-6 shrink-0 text-yellow-600" />
		<div className="flex-1">
			<h4 className="mb-0.5 font-semibold text-gray-900">{title}</h4>
			{message && <p className="text-gray-600 text-sm">{message}</p>}
		</div>
	</div>
);

export const InfoToast = ({ title, message }: ToastProps) => (
	<div className="flex items-start gap-3 rounded-xl border border-blue-200 bg-white p-4 shadow-lg">
		<Info className="h-6 w-6 shrink-0 text-blue-600" />
		<div className="flex-1">
			<h4 className="mb-0.5 font-semibold text-gray-900">{title}</h4>
			{message && <p className="text-gray-600 text-sm">{message}</p>}
		</div>
	</div>
);
