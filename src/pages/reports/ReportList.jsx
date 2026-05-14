import React from 'react';
import Card, { CardHeader, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { reports } from '../../data/mockData';
import { FileText, Download, TrendingUp, BarChart3, PieChart, Users, FileBarChart, ExternalLink } from 'lucide-react';

const ReportList = () => {
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Reports & Analytics</h1>
                    <p className="text-sm text-gray-500 mt-1">Deep dive into platform data with curated intelligence reports.</p>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <select className="px-4 py-2 bg-white border border-border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm flex-1 sm:flex-none">
                        <option value="all">All Merchants</option>
                        <option value="1">Organic Farm Co.</option>
                        <option value="2">Millets India</option>
                        <option value="3">Nature's Best</option>
                    </select>
                    <Button variant="primary" className="h-10 text-sm">
                        <TrendingUp className="w-4 h-4 mr-2" /> Generate
                    </Button>
                </div>
            </div>

            {/* Featured Analytics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <AnalyticsCard icon={BarChart3} title="Sales Growth" value="+24.5%" subtitle="Vs last month" color="text-primary" bg="bg-primary/10" />
                <AnalyticsCard icon={Users} title="New Merchants" value="45" subtitle="This month" color="text-accent" bg="bg-accent/10" />
                <AnalyticsCard icon={PieChart} title="Market Share" value="12.8%" subtitle="Domestic sector" color="text-blue-600" bg="bg-blue-50" />
                <AnalyticsCard icon={FileText} title="Reports Gen." value="124" subtitle="Total reports" color="text-emerald-600" bg="bg-emerald-50" />
            </div>

            <Card>
                <CardHeader title="Available Reports" description="Download periodic system generated audits and analytics." />
                <div className="divide-y divide-border">
                    {reports.map((report) => (
                        <div key={report.id} className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-gray-50 transition-all group">
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm border border-border group-hover:scale-105 transition-transform bg-white`}>
                                    <FileBarChart className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors" />
                                </div>
                                <div className="space-y-0.5">
                                    <h4 className="font-bold text-sm text-gray-900 group-hover:text-primary transition-colors">{report.title}</h4>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="gray" className="px-2 py-0 text-[10px]">{report.type}</Badge>
                                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{report.date}</span>
                                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">• {report.size}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                <Button variant="ghost" size="sm" className="flex-1 sm:flex-none h-8 text-xs">
                                    <ExternalLink className="w-3.5 h-3.5 mr-1" /> Preview
                                </Button>
                                <Button variant="outline" size="sm" className="flex-1 sm:flex-none h-8 text-xs bg-white font-bold text-primary border-primary/20 hover:bg-primary/5">
                                    <Download className="w-3.5 h-3.5 mr-1" /> Download
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
};

const AnalyticsCard = ({ icon: Icon, title, value, subtitle, color, bg }) => (
    <Card className="border-none shadow-sm hover:shadow-md transition-all cursor-default">
        <CardContent className="p-4 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl ${bg} ${color} flex items-center justify-center shrink-0`}>
                <Icon className="w-6 h-6" />
            </div>
            <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{title}</p>
                <h3 className={`text-xl font-black ${color} leading-none mt-1`}>{value}</h3>
                <p className="text-[10px] text-gray-500 mt-1">{subtitle}</p>
            </div>
        </CardContent>
    </Card>
);

export default ReportList;
