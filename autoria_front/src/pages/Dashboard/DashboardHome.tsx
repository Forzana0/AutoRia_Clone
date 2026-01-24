import PageMeta from "../../components/common/PageMeta.tsx";
import EcommerceMetrics from "../../components/ecommerce/EcommerceMetrics.tsx";
import MonthlySalesChart from "../../components/ecommerce/MonthlySalesChart.tsx";
import MonthlyTarget from "../../components/ecommerce/MonthlyTarget.tsx";
import StatisticsChart from "../../components/ecommerce/StatisticsChart.tsx";
import DemographicCard from "../../components/ecommerce/DemographicCard.tsx";
import RecentOrders from "../../components/ecommerce/RecentOrders.tsx";

export default function DashboardHome() {
    return (
        <>
            <PageMeta
                title="React.js Ecommerce Dashboard | TailAdmin - React.js Admin Dashboard Template"
                description="This is React.js Ecommerce Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
            />
            <div className="grid grid-cols-12 gap-4 md:gap-6">
                <div className="col-span-12 space-y-6 xl:col-span-7">
                    <EcommerceMetrics />

                    <MonthlySalesChart />
                </div>

                <div className="col-span-12 xl:col-span-5">
                    <MonthlyTarget />
                </div>

                <div className="col-span-12">
                    <StatisticsChart />
                </div>

                <div className="col-span-12 xl:col-span-5">
                    <DemographicCard />
                </div>

                <div className="col-span-12 xl:col-span-7">
                    <RecentOrders />
                </div>
            </div>
        </>);
}