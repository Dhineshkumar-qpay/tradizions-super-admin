import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Card, { CardHeader, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { merchantOrders } from '../../data/mockData';
import {
    ArrowLeft, ShoppingCart, Store, User, MapPin,
    CreditCard, Calendar, Printer, Package, Truck,
    CheckCircle2, Download, ExternalLink, Mail, Phone,
    PackageCheck, Clock
} from 'lucide-react';

const OrderDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // In a real app, we would fetch based on ID. For now, find in mock data or use first if not found.
    const order = merchantOrders.find(o => o.id === id) || merchantOrders[0];

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-10 h-10 rounded-xl bg-white border border-border flex items-center justify-center text-gray-400 hover:text-primary hover:border-primary transition-all shadow-sm"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase">{order.id}</h1>
                            <Badge variant="success" className="px-3 py-1 text-[10px] font-black tracking-widest uppercase">Verified Order</Badge>
                        </div>
                        <p className="text-gray-500 text-sm font-medium mt-1">Transaction Log Entry • {order.date}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="h-11">
                        <Printer className="w-4 h-4" /> Print Invoice
                    </Button>
                    <Button variant="primary" className="h-11 px-8 shadow-xl shadow-primary/20">
                        <PackageCheck className="w-4 h-4" /> Dispatch Order
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content Area */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Status Overview Card */}
                    <Card className="bg-primary border-none text-white overflow-hidden relative">
                        <div className="absolute right-0 top-0 w-64 h-full bg-white/5 skew-x-[30deg] translate-x-32" />
                        <CardContent className="p-8 relative z-10">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="flex items-center gap-6">
                                    <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
                                        <Package className="w-8 h-8 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-white/60 text-[10px] font-black uppercase tracking-widest mb-1">Current Protocol Status</p>
                                        <h3 className="text-2xl font-black tracking-tight">{order.status.toUpperCase()}</h3>
                                    </div>
                                </div>
                                <div className="flex items-center gap-10">
                                    <div className="text-right">
                                        <p className="text-white/60 text-[10px] font-black uppercase tracking-widest mb-1">Financial Value</p>
                                        <p className="text-3xl font-black tracking-tighter">{order.amount}</p>
                                    </div>
                                    <div className="w-px h-12 bg-white/20 hidden md:block" />
                                    <div className="text-right">
                                        <p className="text-white/60 text-[10px] font-black uppercase tracking-widest mb-1">Items Qty</p>
                                        <p className="text-3xl font-black tracking-tighter">03</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Order Manifest */}
                    <Card>
                        <CardHeader title="Order Manifest" description="Detailed registry of items processed in this transaction." />
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gray-50/50 border-y border-border">
                                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-left">Nomenclature</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Batch</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Value</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    <tr className="hover:bg-gray-50/30 transition-colors">
                                        <td className="px-6 py-6 font-medium">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400">
                                                    <Package className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-gray-900 tracking-tight">{order.items.split('x')[0].trim()}</p>
                                                    <p className="text-[10px] text-gray-400 font-bold mt-0.5">Category: Organic Grains • SKU: GRN-293</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6 text-center">
                                            <span className="inline-block px-3 py-1 bg-primary/5 rounded-lg text-primary font-black text-xs">
                                                Qty: {order.items.split('x')[1]?.trim() || '1'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-6 text-right">
                                            <p className="text-sm font-black text-gray-900">{order.amount}</p>
                                        </td>
                                    </tr>
                                    {/* Mocking additional items if it was plural */}
                                    <tr className="hover:bg-gray-50/30 transition-colors">
                                        <td className="px-6 py-6 font-medium">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400">
                                                    <Package className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-gray-900 tracking-tight">Stone Ground Ragi Flour</p>
                                                    <p className="text-[10px] text-gray-400 font-bold mt-0.5">Category: Flours • SKU: FLR-112</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6 text-center">
                                            <span className="inline-block px-3 py-1 bg-primary/5 rounded-lg text-primary font-black text-xs">Qty: 02</span>
                                        </td>
                                        <td className="px-6 py-6 text-right">
                                            <p className="text-sm font-black text-gray-900">₹450.00</p>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <CardContent className="bg-gray-50/50 p-8 border-t border-border">
                            <div className="flex flex-col md:flex-row justify-between gap-8">
                                <div className="space-y-4 max-w-sm">
                                    <div className="flex items-center gap-2">
                                        <CreditCard className="w-4 h-4 text-primary" />
                                        <h4 className="text-[10px] font-black text-gray-900 uppercase tracking-widest">Financial Protocol</h4>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-white border border-border space-y-2 shadow-sm">
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Method</span>
                                            <span className="text-xs font-black text-emerald-600">UPI TRANSFER</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Txn ID</span>
                                            <span className="text-[10px] font-mono font-bold text-gray-900">TXN_9283748293</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="w-full md:w-64 space-y-3">
                                    <div className="flex justify-between text-sm font-medium text-gray-500">
                                        <span>Subtotal</span>
                                        <span className="font-bold text-gray-900">₹1,950.00</span>
                                    </div>
                                    <div className="flex justify-between text-sm font-medium text-gray-500">
                                        <span>Logistics Fee</span>
                                        <span className="font-bold text-gray-900">₹150.00</span>
                                    </div>
                                    <div className="h-px bg-gray-200 my-2" />
                                    <div className="flex justify-between items-baseline">
                                        <span className="text-[10px] font-black text-gray-900 uppercase tracking-widest">Grand Total</span>
                                        <span className="text-2xl font-black text-primary tracking-tighter">{order.amount}</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar Info Area */}
                <div className="space-y-6">
                    {/* Merchant Node Card */}
                    <Card className="border-l-4 border-l-primary">
                        <CardContent className="p-6 space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary border border-primary/10">
                                    <Store className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Origin Node</p>
                                    <h4 className="text-lg font-black text-gray-900 tracking-tight leading-tight">{order.merchant}</h4>
                                </div>
                            </div>
                            <div className="space-y-3 pt-3 border-t border-gray-100">
                                <div className="flex items-center gap-3">
                                    <Mail className="w-4 h-4 text-gray-400" />
                                    <p className="text-sm font-bold text-gray-600">fulfillment@greenearth.com</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Phone className="w-4 h-4 text-gray-400" />
                                    <p className="text-sm font-bold text-gray-600">+91 98374 82934</p>
                                </div>
                            </div>
                            <Button variant="outline" className="w-full text-[10px] font-black uppercase tracking-widest h-11 border-gray-200">
                                <ExternalLink className="w-3.5 h-3.5" /> Contact Merchant
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Logistics Card */}
                    <Card>
                        <CardHeader title="Deployment Terminal" />
                        <CardContent className="p-6 pt-0 space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-xl bg-accent/5 flex items-center justify-center text-accent shrink-0 border border-accent/10">
                                    <MapPin className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-black text-gray-900 tracking-tight leading-snug">{order.customer}</p>
                                    <p className="text-xs font-bold text-gray-500 leading-relaxed mt-2">
                                        Sector 42, Alpha Heights, Institutional Area,<br />
                                        Salem, Tamil Nadu - 636001
                                    </p>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-gray-100 space-y-6">
                                <div className="flex items-center gap-2">
                                    <Truck className="w-4 h-4 text-primary" />
                                    <h5 className="text-[10px] font-black text-gray-900 uppercase tracking-widest">Protocol Sequence</h5>
                                </div>
                                <div className="space-y-6 relative ml-2">
                                    <div className="absolute left-1 top-0 bottom-0 w-0.5 bg-gray-100" />
                                    {[
                                        { label: 'Order Initialized', time: '09:42 AM', active: true, icon: Clock },
                                        { label: 'Merchant Accepted', time: '10:15 AM', active: true, icon: CheckCircle2 },
                                        { label: 'Logistics Assigned', time: 'Pending', active: false, icon: Truck },
                                    ].map((step, idx) => (
                                        <div key={idx} className="flex items-center gap-4 relative z-10">
                                            <div className={`w-2.5 h-2.5 rounded-full border-2 ${step.active ? 'bg-primary border-primary' : 'bg-white border-gray-200'}`} />
                                            <div className="flex-1 flex justify-between items-center">
                                                <span className={`text-[10px] font-black uppercase tracking-widest ${step.active ? 'text-gray-900' : 'text-gray-300'}`}>{step.label}</span>
                                                <span className="text-[9px] font-bold text-gray-400">{step.time}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default OrderDetail;
