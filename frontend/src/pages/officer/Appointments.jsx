import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import api from '../../lib/api';
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Calendar,
    Search,
    RefreshCcw,
    CheckCircle,
    XCircle,
    Clock,
    User,
    AlertCircle
} from 'lucide-react';

export default function Appointments() {
    const { user } = useAuth();
    const { lang } = useLanguage();
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sectors, setSectors] = useState([]);
    const [selectedSector, setSelectedSector] = useState(null);

    useEffect(() => {
        fetchSectors();
    }, []);

    useEffect(() => {
        if (selectedSector) {
            fetchAppointments();
        }
    }, [selectedSector]);

    const fetchSectors = async () => {
        try {
            const { data } = await api.get('/services/sectors');
            setSectors(data);
            if (data.length > 0) {
                setSelectedSector(data[0]);
            }
        } catch (err) {
            console.error('Failed to fetch sectors', err);
        }
    };

    const fetchAppointments = async () => {
        if (!selectedSector) return;
        setLoading(true);
        try {
            const { data } = await api.get(`/appointments/sector/${selectedSector.id}`);
            setAppointments(data);
        } catch (err) {
            console.error('Failed to fetch appointments', err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (appointmentId, status) => {
        try {
            await api.patch(`/appointments/status/${appointmentId}`, { status });
            fetchAppointments();
        } catch (err) {
            console.error('Failed to update status', err);
            alert('Failed to update status. Make sure the backend endpoint is implemented.');
        }
    };

    const filteredAppointments = appointments.filter(app => {
        const matchesSearch = app.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            app.user?.phoneNumber?.includes(searchQuery) ||
            app.service?.name?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getStatusColor = (status) => {
        switch (status) {
            case 'PENDING': return 'bg-yellow-500';
            case 'SCHEDULED': return 'bg-blue-500';
            case 'COMPLETED': return 'bg-green-500';
            case 'CANCELLED': return 'bg-red-500';
            case 'REJECTED': return 'bg-gray-500';
            default: return 'bg-muted';
        }
    };

    return (
        <div className="space-y-8">
            {/* Header Section */}
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-4xl font-black tracking-tight">
                        {lang === 'en' ? 'Appointments' : 'ቀጠሮዎች'}
                    </h2>
                    <p className="text-muted-foreground font-semibold mt-2">
                        {lang === 'en' ? 'Manage scheduled visits and registrations' : 'የተያዙ ጉብኝቶችን እና ምዝገባዎችን ያስተዳድሩ'}
                    </p>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchAppointments}
                    className="rounded-xl gap-2 font-bold"
                    disabled={loading}
                >
                    <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    {lang === 'en' ? 'Refresh' : 'አድስ'}
                </Button>
            </div>

            {/* Sector Selector */}
            {sectors.length > 1 && (
                <Card className="rounded-3xl border-border">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <label className="text-sm font-bold">
                                {lang === 'en' ? 'Active Sector:' : 'ንቁ ዘርፍ:'}
                            </label>
                            <Select value={selectedSector?.id} onValueChange={(id) => setSelectedSector(sectors.find(s => s.id === id))}>
                                <SelectTrigger className="w-64 rounded-xl font-bold">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {sectors.map(sector => (
                                        <SelectItem key={sector.id} value={sector.id}>{sector.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Search and Filter */}
            <Card className="rounded-3xl border-border">
                <CardContent className="p-6">
                    <div className="flex gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder={lang === 'en' ? 'Search by citizen, phone, or service...' : 'በስም፣ ስልክ ወይም አገልግሎት ይፈልጉ...'}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 rounded-xl font-semibold"
                            />
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-48 rounded-xl font-bold">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">{lang === 'en' ? 'All Status' : 'ሁሉም ሁኔታ'}</SelectItem>
                                <SelectItem value="PENDING">{lang === 'en' ? 'Pending Approval' : 'ፍቃድ በመጠባበቅ ላይ'}</SelectItem>
                                <SelectItem value="SCHEDULED">{lang === 'en' ? 'Scheduled' : 'የተያዘ'}</SelectItem>
                                <SelectItem value="COMPLETED">{lang === 'en' ? 'Completed' : 'ተጠናቋል'}</SelectItem>
                                <SelectItem value="CANCELLED">{lang === 'en' ? 'Cancelled' : 'ተሰርዟል'}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Appointments List */}
            <Card className="rounded-[32px] border-border">
                <CardHeader className="pb-4">
                    <CardTitle className="text-2xl font-black">
                        {lang === 'en' ? 'Appointment List' : 'የቀጠሮዎች ዝርዝር'}
                    </CardTitle>
                    <CardDescription className="font-semibold">
                        {filteredAppointments.length} {lang === 'en' ? 'appointments found' : 'ቀጠሮዎች ተገኝተዋል'}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {filteredAppointments.length > 0 ? (
                        <div className="space-y-3">
                            {filteredAppointments.map((app) => (
                                <div
                                    key={app.id}
                                    className="p-6 rounded-2xl border-2 border-border hover:border-primary/30 transition-all flex items-center justify-between"
                                >
                                    <div className="flex items-center gap-6 flex-1">
                                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                            <Calendar className="w-6 h-6 text-primary" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-1">
                                                <h4 className="font-black text-lg">{app.user?.name}</h4>
                                                <Badge className={`${getStatusColor(app.status)} font-bold`}>
                                                    {app.status}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-4 text-sm text-muted-foreground font-semibold flex-wrap">
                                                <span className="flex items-center gap-1">
                                                    <User className="w-3 h-3" />
                                                    {app.user?.phoneNumber}
                                                </span>
                                                <span>•</span>
                                                <span className="font-bold text-foreground">{app.service?.name}</span>
                                                <span>•</span>
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    {new Date(app.date).toLocaleDateString()}
                                                </span>
                                                <span>•</span>
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {app.timeSlot}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {app.status === 'SCHEDULED' && (
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                onClick={() => handleUpdateStatus(app.id, 'COMPLETED')}
                                                className="rounded-xl font-bold bg-green-600 hover:bg-green-700 gap-2"
                                            >
                                                <CheckCircle className="w-4 h-4" />
                                                {lang === 'en' ? 'Complete' : 'አጠናቅ'}
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="destructive"
                                                onClick={() => handleUpdateStatus(app.id, 'CANCELLED')}
                                                className="rounded-xl font-bold gap-2"
                                            >
                                                <XCircle className="w-4 h-4" />
                                                {lang === 'en' ? 'Cancel' : 'ሰርዝ'}
                                            </Button>
                                        </div>
                                    )}

                                    {app.status === 'PENDING' && (
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                onClick={() => handleUpdateStatus(app.id, 'SCHEDULED')}
                                                className="rounded-xl font-bold bg-blue-600 hover:bg-blue-700 gap-2"
                                            >
                                                <CheckCircle className="w-4 h-4" />
                                                {lang === 'en' ? 'Approve' : 'ፍቀድ'}
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="destructive"
                                                onClick={() => handleUpdateStatus(app.id, 'REJECTED')}
                                                className="rounded-xl font-bold gap-2"
                                            >
                                                <XCircle className="w-4 h-4" />
                                                {lang === 'en' ? 'Reject' : 'ውድቅ አድርግ'}
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-20 text-center">
                            <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                                <AlertCircle className="w-8 h-8 text-muted-foreground" />
                            </div>
                            <h3 className="text-xl font-black text-muted-foreground mb-2">
                                {lang === 'en' ? 'No Appointments Found' : 'ምንም ቀጠሮዎች አልተገኙም'}
                            </h3>
                            <p className="text-muted-foreground font-semibold">
                                {lang === 'en' ? 'Try changing your filters or searching for something else' : 'ማጣሪያዎችዎን ለመለወጥ ወይም ሌላ ነገር ለመፈለግ ይሞክሩ'}
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
