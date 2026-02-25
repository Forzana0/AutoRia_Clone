import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { Provider } from 'react-redux'
import store from './redux/store.ts'
import { GoogleOAuthProvider } from '@react-oauth/google'

// Вставте свій Google Client ID нижче
const GOOGLE_CLIENT_ID = '670960927390-kcdi60sevo2929648pqkd5v6hqvaldvq.apps.googleusercontent.com';

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <Provider store={store}>
            <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
                <App />
            </GoogleOAuthProvider>
        </Provider>
    </React.StrictMode>,
)
