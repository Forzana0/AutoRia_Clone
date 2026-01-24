const ForgotSuccessPage: React.FC = () => {
    return (
        <div className="min-h-[600px] flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md text-center animate-fade-in">
                <div className="text-4xl mb-4 text-green-500">✅</div>

                <h2 className="text-2xl font-semibold mb-4">Лист надіслано</h2>

                <p className="text-gray-600 mb-6">
                    Ми надіслали інструкції для відновлення паролю.
                </p>
            </div>
        </div>
    );
};

export default ForgotSuccessPage;