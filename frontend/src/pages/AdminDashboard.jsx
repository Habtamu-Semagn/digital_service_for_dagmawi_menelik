import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import {
    ShieldCheck,
    BarChart3,
    Users,
    Settings,
    Activity,
    Plus,
    MoreVertical,
    LogOut,
    Building2,
    RefreshCcw,
    X,
    ChevronRight,
    Search,
    Trash2,
    Edit3,
    Layers,
    User as UserIcon,
    Menu
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar";
import { useLanguage } from '../context/LanguageContext';
import ThemeToggle from '../components/ThemeToggle';
import { translations } from '../lib/translations';

export default function AdminDashboard() {
    const { user, logout } = useAuth();
    const { lang, setLang } = useLanguage();
    const t = translations[lang];
    const [stats, setStats] = useState({ users: 0, queues: 0, sectors: 0 });
    const [sectors, setSectors] = useState([]);
    const [showSectorModal, setShowSectorModal] = useState(false);
    const [sectorForm, setSectorForm] = useState({ name: '', description: '', icon: '' });
    const [editingSector, setEditingSector] = useState(null);

    const [activeTab, setActiveTab] = useState('overview');
    const [selectedSectorForServices, setSelectedSectorForServices] = useState(null);
    const [users, setUsers] = useState([]);
    const [logs, setLogs] = useState([]);
    const [showServiceModal, setShowServiceModal] = useState(false);
    const [editingService, setEditingService] = useState(null);
    const [serviceForm, setServiceForm] = useState({
        name: '', description: '', mode: 'QUEUE', availability: 'Mon-Fri, 8:30am-5:30pm', icon: '', sectorId: ''
    });
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'overview' || activeTab === 'services') {
                const [sectorsRes, statsRes] = await Promise.all([
                    api.get('/services/sectors'),
                    api.get('/admin/stats')
                ]);
                setSectors(sectorsRes.data);
                setStats(statsRes.data);

                if (selectedSectorForServices) {
                    const updated = sectorsRes.data.find(s => s.id === selectedSectorForServices.id);
                    setSelectedSectorForServices(updated);
                }
            } else if (activeTab === 'users') {
                const res = await api.get('/admin/users');
                setUsers(res.data);
            } else if (activeTab === 'logs') {
                const res = await api.get('/admin/logs');
                setLogs(res.data);
            }
        } catch (err) {
            console.error('Failed to fetch dashboard data', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const handleSaveSector = async (e) => {
        e.preventDefault();
        try {
            if (editingSector) {
                await api.patch(`/services/sectors/${editingSector.id}`, sectorForm);
            } else {
                await api.post('/services/sectors', sectorForm);
            }
            setShowSectorModal(false);
            setEditingSector(null);
            setSectorForm({ name: '', description: '', icon: '' });
            fetchData();
        } catch (err) {
            console.error('Failed to save sector', err);
        }
    };

    const handleDeleteSector = async (id) => {
        if (!confirm('Are you sure you want to delete this sector and all its services?')) return;
        try {
            await api.delete(`/services/sectors/${id}`);
            fetchData();
        } catch (err) {
            console.error('Failed to delete sector', err);
        }
    };

    const handleSaveService = async (e) => {
        e.preventDefault();
        try {
            if (editingService) {
                await api.patch(`/services/services/${editingService.id}`, serviceForm);
            } else {
                await api.post('/services/services', { ...serviceForm, sectorId: selectedSectorForServices.id });
            }
            setShowServiceModal(false);
            setEditingService(null);
            fetchData();
        } catch (err) {
            console.error('Failed to save service', err);
        }
    };

    const handleDeleteService = async (id) => {
        if (!confirm('Are you sure?')) return;
        try {
            await api.delete(`/services/services/${id}`);
            fetchData();
        } catch (err) {
            console.error('Failed to delete service', err);
        }
    };

    return (
        <SidebarProvider>
            <div className="flex min-h-screen bg-background w-full">
                <Sidebar className="border-r border-border bg-card">
                    <SidebarHeader className="p-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shrink-0">
                                <ShieldCheck className="text-primary-foreground w-6 h-6" />
                            </div>
                            <div className="flex flex-col overflow-hidden">
                                <span className="font-black text-sm uppercase leading-none truncate">Admin Panel</span>
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1 truncate">Digital Service</span>
                            </div>
                        </div>
                    </SidebarHeader>
                    <SidebarContent className="p-4">
                        <SidebarMenu>
                            {[
                                { id: 'overview', label: 'System Overview', icon: BarChart3 },
                                { id: 'users', label: 'User Directory', icon: Users },
                                { id: 'logs', label: 'System Logs', icon: Activity },
                                { id: 'settings', label: 'System Settings', icon: Settings },
                            ].map((item) => (
                                <SidebarMenuItem key={item.id}>
                                    <SidebarMenuButton
                                        isActive={activeTab === item.id}
                                        onClick={() => setActiveTab(item.id)}
                                        className="gap-4 h-12"
                                    >
                                        <item.icon className="w-5 h-5" />
                                        <span className="truncate">{item.label}</span>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarContent>
                    <SidebarFooter className="p-6 border-t border-border">
                        <Button
                            variant="ghost"
                            className="w-full justify-start gap-4 text-destructive font-bold h-10 px-3 hover:bg-destructive/10"
                            onClick={logout}
                        >
                            <LogOut className="w-5 h-5" />
                            <span>Log Out</span>
                        </Button>
                    </SidebarFooter>
                </Sidebar>

                <main className="flex-1 flex flex-col h-screen overflow-hidden">
                    <header className="h-20 border-b border-border bg-background/50 backdrop-blur-md px-8 flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-4">
                            <SidebarTrigger className="lg:hidden" />
                            <Badge className="bg-primary/5 text-primary border-none px-4 py-1 font-bold hidden sm:flex">LIVE SYSTEM</Badge>
                            <h2 className="text-xl font-black truncate">
                                {activeTab === 'services' ? `Manage: ${selectedSectorForServices?.name}` :
                                    activeTab === 'users' ? 'User Management' :
                                        activeTab === 'logs' ? 'System Activities' :
                                            activeTab === 'settings' ? 'System Settings' :
                                                'Overview'}
                            </h2>
                        </div>

                        <div className="flex items-center gap-4">
                            {activeTab === 'services' && (
                                <Button variant="ghost" className="font-bold gap-2" onClick={() => setActiveTab('overview')}>
                                    <ChevronRight className="w-4 h-4 rotate-180" /> Back
                                </Button>
                            )}
                            <ThemeToggle />
                            <Button variant="outline" size="sm" className="rounded-full gap-2 font-bold" onClick={fetchData}>
                                <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Sync
                            </Button>
                            <Separator orientation="vertical" className="h-8 mx-2" />
                            <div className="flex items-center gap-4">
                                <div className="text-right hidden sm:block">
                                    <div className="text-sm font-black text-foreground">{user?.name}</div>
                                    <div className="text-[10px] font-bold text-destructive uppercase">Admin</div>
                                </div>
                                <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center text-destructive font-black">
                                    <UserIcon className="w-6 h-6" />
                                </div>
                            </div>
                        </div>
                    </header>

                    <div className="p-8 overflow-y-auto flex-1 bg-muted/5">
                        <div className="max-w-6xl mx-auto space-y-12">
                            {activeTab === 'overview' && (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                        {[
                                            { label: 'Citizens', value: stats.users, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                                            { label: 'Tickets', value: stats.queues, icon: BarChart3, color: 'text-primary', bg: 'bg-primary/10' },
                                            { label: 'Sectors', value: stats.sectors, icon: Activity, color: 'text-green-500', bg: 'bg-green-500/10' },
                                        ].map((stat, i) => (
                                            <Card key={i} className="rounded-[40px] border-border p-8 bg-card shadow-sm">
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color}`}>
                                                        <stat.icon className="w-6 h-6" />
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-muted-foreground uppercase tracking-widest">{stat.label}</p>
                                                    <p className="text-4xl font-black mt-1">{stat.value}</p>
                                                </div>
                                            </Card>
                                        ))}
                                    </div>

                                    <section className="space-y-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="text-3xl font-black">Sectors</h3>
                                                <p className="text-muted-foreground font-bold">Configure service categories</p>
                                            </div>
                                            <Button className="rounded-2xl h-14 px-8 bg-primary hover:bg-primary/90 font-black gap-3 shadow-xl" onClick={() => { setEditingSector(null); setSectorForm({ name: '', description: '', icon: '' }); setShowSectorModal(true); }}>
                                                <Plus className="w-5 h-5" /> ADD SECTOR
                                            </Button>
                                        </div>

                                        <div className="grid lg:grid-cols-2 gap-6">
                                            {sectors.map((sector) => (
                                                <Card key={sector.id} className="rounded-[40px] p-8 border-border hover:border-primary/50 transition-all bg-card shadow-sm group">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-6">
                                                            <div className="w-16 h-16 bg-muted rounded-[24px] flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                                                                <Building2 className="w-8 h-8 text-primary" />
                                                            </div>
                                                            <div>
                                                                <h4 className="font-black text-2xl">{sector.name}</h4>
                                                                <Badge variant="secondary" className="rounded-lg font-bold mt-1">{sector.services?.length || 0} Services</Badge>
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <Button variant="outline" size="icon" className="rounded-2xl w-12 h-12 hover:bg-primary/10 hover:text-primary border-border" onClick={() => { setEditingSector(sector); setSectorForm({ name: sector.name, description: sector.description, icon: sector.icon }); setShowSectorModal(true); }}>
                                                                <Edit3 className="w-5 h-5" />
                                                            </Button>
                                                            <Button variant="outline" size="icon" className="rounded-2xl w-12 h-12 hover:bg-destructive/10 hover:text-destructive border-border" onClick={() => handleDeleteSector(sector.id)}>
                                                                <Trash2 className="w-5 h-5" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                    <div className="mt-8 pt-6 border-t border-border flex justify-end">
                                                        <Button variant="ghost" className="rounded-xl gap-2 text-primary font-black group-hover:translate-x-1 transition-transform" onClick={() => { setSelectedSectorForServices(sector); setActiveTab('services'); }}>
                                                            MANAGE SERVICES <ChevronRight className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </Card>
                                            ))}
                                        </div>
                                    </section>
                                </>
                            )}

                            {activeTab === 'services' && (
                                <section className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-6">
                                            <div className="w-20 h-20 bg-primary/10 rounded-[32px] flex items-center justify-center">
                                                <Layers className="w-10 h-10 text-primary" />
                                            </div>
                                            <div>
                                                <h3 className="text-4xl font-black">All Services</h3>
                                                <p className="text-muted-foreground font-bold">Configuring for {selectedSectorForServices?.name}</p>
                                            </div>
                                        </div>
                                        <Button className="rounded-2xl h-14 px-8 bg-primary hover:bg-primary/90 font-black gap-3 shadow-xl" onClick={() => { setEditingService(null); setServiceForm({ name: '', description: '', mode: 'QUEUE', availability: 'Mon-Fri, 8:30am-5:30pm', icon: '', sectorId: selectedSectorForServices.id }); setShowServiceModal(true); }}>
                                            <Plus className="w-5 h-5" /> ADD SERVICE
                                        </Button>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4">
                                        {(selectedSectorForServices?.services || []).map((service) => (
                                            <Card key={service.id} className="rounded-[32px] p-6 border-border bg-card flex items-center justify-between hover:border-primary/30 transition-colors">
                                                <div className="flex items-center gap-6">
                                                    <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center font-black text-primary">
                                                        {service.name[0]}
                                                    </div>
                                                    <div>
                                                        <div className="font-black text-xl flex items-center gap-3">
                                                            {service.name}
                                                            <Badge className="rounded-lg bg-primary/10 text-primary border-none">{service.mode}</Badge>
                                                        </div>
                                                        <div className="text-sm text-muted-foreground font-bold">{service.availability}</div>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button variant="outline" size="sm" className="rounded-xl px-4 font-bold" onClick={() => { setEditingService(service); setServiceForm({ name: service.name, description: service.description, mode: service.mode, availability: service.availability, icon: service.icon, sectorId: service.sectorId }); setShowServiceModal(true); }}>Edit</Button>
                                                    <Button variant="ghost" size="sm" className="rounded-xl px-4 font-bold text-destructive" onClick={() => handleDeleteService(service.id)}>Delete</Button>
                                                </div>
                                            </Card>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {activeTab === 'users' && (
                                <section className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-3xl font-black">User Directory</h3>
                                        <div className="relative w-72">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                            <Input
                                                placeholder="Search users..."
                                                className="pl-10 rounded-xl"
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <Card className="rounded-[40px] border-border bg-card overflow-hidden">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>User</TableHead>
                                                    <TableHead>Phone</TableHead>
                                                    <TableHead>Role</TableHead>
                                                    <TableHead className="text-right">Actions</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {users.filter(u =>
                                                    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                                    u.phoneNumber.includes(searchTerm) ||
                                                    u.role.toLowerCase().includes(searchTerm.toLowerCase())
                                                ).map((u) => (
                                                    <TableRow key={u.id}>
                                                        <TableCell className="font-black">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                                                    <UserIcon className="w-4 h-4" />
                                                                </div>
                                                                {u.name}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="font-bold text-muted-foreground">{u.phoneNumber}</TableCell>
                                                        <TableCell>
                                                            <Badge className={`rounded-lg font-bold ${u.role === 'ADMIN' ? 'bg-destructive/10 text-destructive' : u.role === 'OFFICER' ? 'bg-primary/10 text-primary' : 'bg-secondary text-secondary-foreground'}`}>
                                                                {u.role}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <Button variant="ghost" size="icon" className="rounded-xl"><MoreVertical className="w-4 h-4" /></Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </Card>
                                </section>
                            )}

                            {activeTab === 'logs' && (
                                <section className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-3xl font-black">System Logs</h3>
                                        <div className="relative w-72">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                            <Input
                                                placeholder="Filter logs..."
                                                className="pl-10 rounded-xl"
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <Card className="rounded-[40px] border-border bg-card overflow-hidden">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Action</TableHead>
                                                    <TableHead>Details</TableHead>
                                                    <TableHead>By</TableHead>
                                                    <TableHead>Date</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {logs.filter(l =>
                                                    l.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                                    l.details?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                                    l.user?.name?.toLowerCase().includes(searchTerm.toLowerCase())
                                                ).map((log) => (
                                                    <TableRow key={log.id}>
                                                        <TableCell className="font-black">{log.action}</TableCell>
                                                        <TableCell className="font-bold text-muted-foreground text-xs">{log.details}</TableCell>
                                                        <TableCell className="font-black text-primary">{log.user?.name || 'System'}</TableCell>
                                                        <TableCell className="text-[10px] font-black uppercase text-muted-foreground">
                                                            {new Date(log.createdAt).toLocaleString()}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </Card>
                                </section>
                            )}

                            {activeTab === 'settings' && (
                                <section className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <h3 className="text-3xl font-black">Global Settings</h3>
                                    <div className="grid md:grid-cols-2 gap-8">
                                        <Card className="rounded-[40px] p-8 border-border bg-card space-y-6">
                                            <h4 className="font-black text-xl">Appearance</h4>
                                            <div className="flex items-center justify-between p-6 bg-muted/30 rounded-3xl border border-border">
                                                <div>
                                                    <p className="font-black">Theme Mode</p>
                                                    <p className="text-sm text-muted-foreground font-bold">Switch between dark and light</p>
                                                </div>
                                                <ThemeToggle />
                                            </div>
                                        </Card>
                                        <Card className="rounded-[40px] p-8 border-border bg-card space-y-6">
                                            <h4 className="font-black text-xl">System Status</h4>
                                            <div className="flex items-center justify-between p-6 bg-primary/5 rounded-3xl border border-primary/10">
                                                <div>
                                                    <p className="font-black text-primary">System is Online</p>
                                                    <p className="text-sm text-primary/60 font-bold">Maintenance mode is disabled</p>
                                                </div>
                                                <Badge className="bg-primary text-primary-foreground font-black">ACTIVE</Badge>
                                            </div>
                                        </Card>
                                    </div>
                                </section>
                            )}
                        </div>
                    </div>
                </main>

                <Dialog open={showSectorModal} onOpenChange={setShowSectorModal}>
                    <DialogContent onClose={() => setShowSectorModal(false)}>
                        <DialogHeader>
                            <DialogTitle>{editingSector ? 'Update Sector' : 'New Sector'}</DialogTitle>
                            <DialogDescription>Configure service categories for the system.</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSaveSector} className="space-y-6 py-4">
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase text-muted-foreground">Title</label>
                                <Input className="rounded-2xl h-14 font-bold text-lg" value={sectorForm.name} onChange={e => setSectorForm({ ...sectorForm, name: e.target.value })} required />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase text-muted-foreground">Description</label>
                                <textarea className="w-full rounded-2xl h-32 p-4 border border-border bg-muted/20 font-bold outline-none" value={sectorForm.description} onChange={e => setSectorForm({ ...sectorForm, description: e.target.value })} />
                            </div>
                            <DialogFooter className="pt-4">
                                <Button type="submit" className="w-full rounded-2xl h-14 font-black bg-primary">SAVE SECTOR</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                <Dialog open={showServiceModal} onOpenChange={setShowServiceModal}>
                    <DialogContent onClose={() => setShowServiceModal(false)}>
                        <DialogHeader>
                            <DialogTitle>{editingService ? 'Update Service' : 'New Service'}</DialogTitle>
                            <DialogDescription>Define the workflow and availability for this service.</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSaveService} className="space-y-6 py-4">
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase text-muted-foreground">Service Name</label>
                                <Input className="rounded-2xl h-14 font-bold" value={serviceForm.name} onChange={e => setServiceForm({ ...serviceForm, name: e.target.value })} required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase text-muted-foreground">Mode</label>
                                    <select className="w-full h-14 rounded-2xl border border-border bg-muted/20 px-4 font-bold outline-none" value={serviceForm.mode} onChange={e => setServiceForm({ ...serviceForm, mode: e.target.value })}>
                                        <option value="QUEUE">QUEUE</option>
                                        <option value="APPOINTMENT">APPOINTMENT</option>
                                        <option value="ONLINE">ONLINE ONLY</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase text-muted-foreground">Availability</label>
                                    <Input className="rounded-2xl h-14 font-bold" value={serviceForm.availability} onChange={e => setServiceForm({ ...serviceForm, availability: e.target.value })} />
                                </div>
                            </div>
                            <DialogFooter className="pt-4">
                                <Button type="submit" className="w-full rounded-2xl h-14 font-black bg-primary">SAVE SERVICE</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </SidebarProvider>
    );
}

