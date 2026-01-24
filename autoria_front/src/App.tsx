import React from "react";
import './App.css'
import {BrowserRouter as Router, Route, Routes} from "react-router";
// Layouts
const UserLayout = React.lazy(() => import("./layout/user/UserLayout.tsx"));
const AdminLayout = React.lazy(() => import("./layout/admin/AdminLayout.tsx"));

// Pages
const UserHomePage = React.lazy(() => import("./pages/OtherPage/UserHomePage.tsx"));
const DashboardHome = React.lazy(() => import("./pages/Dashboard/DashboardHome.tsx"));
const NotFound = React.lazy(() => import("./pages/OtherPage/NotFound.tsx"));

const CategoriesListPage = React.lazy(() => import("./pages/Categories"));
const CategoriesCreatePage = React.lazy(() => import("./pages/Categories/create"));
const CategoriesEditPage = React.lazy(() => import("./pages/Categories/edit"));

const LoginPage = React.lazy(() => import("./pages/Account/Login"));
const RegistrationPage = React.lazy(() => import("./pages/Account/register"));
const ForgotPasswordPage = React.lazy(() => import("./pages/Account/ForgotPassword"));
const ForgotSuccessPage = React.lazy(() => import("./pages/Account/ForgotSuccess.tsx"));
const ResetPasswordPage = React.lazy(() => import("./pages/Account/ResetPassword"));

const ProductsPage = React.lazy(() => import("./pages/Products/List"));
const AdminProductListPage = React.lazy(() => import("./admin/pages/Products/List/AdminProductListPage.tsx"));
const AdminProductCreatePage = React.lazy(() => import("./admin/pages/Products/Create/AdminProductCreatePage.tsx"));
const UserListPage = React.lazy(() => import("./admin/pages/Users"));

// Components
import RequireAdmin from "./components/ProtectedRoute/RequireAdmin.tsx";



const App: React.FC = () => {

    return (
        <>
            <Router>
                <React.Suspense fallback={<div>Завантаження...</div>}>
                <Routes>
                    {/*<Route index element={<UserLayout>}></Route>*/}

                    <Route path="/" element={<UserLayout/>}>
                        <Route index element={<UserHomePage/>}/>

                        {/*<Route path={'login'} element={<LoginPage/>} />*/}
                        <Route path={'login'} element={<LoginPage />} />
                        <Route path={'forgot-password'} element={<ForgotPasswordPage/>} />
                        <Route path="forgot-success" element={<ForgotSuccessPage />} />
                        <Route path="reset-password" element={<ResetPasswordPage />} />
                        <Route path="register" element={<RegistrationPage />} />
                        <Route path="products" element={<ProductsPage/>}/>
                    </Route>

                    <Route path="admin" element={<RequireAdmin/>}>
                        <Route element={<AdminLayout/>}>
                            <Route path="home" element={<DashboardHome/>}/>

                            <Route path="categories">
                                <Route index element={<CategoriesListPage/>}/>
                                <Route path={'create'} element={<CategoriesCreatePage/>}/>
                                <Route path={'edit/:id'} element={<CategoriesEditPage/>}/>
                            </Route>

                            <Route path="products">
                                <Route index element={<AdminProductListPage/>}/>
                                <Route path={'create'} element={<AdminProductCreatePage/>}/>
                            </Route>

                            <Route path="users">
                                <Route index element={<UserListPage />}></Route>
                            </Route>

                        </Route>
                    </Route>


                    <Route path="*" element={<NotFound/>}/>
                </Routes>
                </React.Suspense>
            </Router>
        </>
    )
}

export default App
