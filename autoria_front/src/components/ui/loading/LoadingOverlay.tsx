import { Spin } from "antd";

const LoadingOverlay: React.FC = () => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
            <Spin size="large" />
        </div>
    );
};

export default LoadingOverlay;
