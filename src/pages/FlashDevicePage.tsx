import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  DeviceType,
  Version,
  ResourceType,
  FlashMode,
  FlashTask,
} from "../types";
import {
  deviceTypeApi,
  versionApi,
  resourceTypeApi,
  taskApi,
} from "../services/api";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Checkbox } from "../components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Badge } from "../components/ui/badge";
import {
  Zap,
  Server,
  Bot,
  Loader2,
  CheckCircle2,
  Plus,
  Trash2,
} from "lucide-react";
import { taskWebSocket } from "../services/websocket";

interface ServerInfo {
  id: string;
  ip: string;
  port: string;
  username: string;
  password: string;
}

export function FlashDevicePage() {
  const [deviceTypes, setDeviceTypes] = useState<DeviceType[]>([]);
  const [versions, setVersions] = useState<Version[]>([]);
  const [softwares, setSoftwares] = useState<ResourceType[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<FlashMode>('robot');
  
  // 机器人模式
  const [selectedDeviceType, setSelectedDeviceType] = useState('');
  const [selectedVersion, setSelectedVersion] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [deviceIp, setDeviceIp] = useState('');
  const [devicePort, setDevicePort] = useState('22');
  const [deviceUsername, setDeviceUsername] = useState('');
  const [devicePassword, setDevicePassword] = useState('');
  
  // 服务器模式
  const [serverCount, setServerCount] = useState<'1' | '3' | '5'>('1');
  const [servers, setServers] = useState<ServerInfo[]>([
    { id: '1', ip: '', port: '22', username: '', password: '' },
  ]);
  const [selectedSoftwares, setSelectedSoftwares] = useState<string[]>([]);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    // 更新服务器数量
    const count = parseInt(serverCount);
    if (servers.length < count) {
      const newServers = [...servers];
      for (let i = servers.length; i < count; i++) {
        newServers.push({
          id: (i + 1).toString(),
          ip: '',
          port: '22',
          username: '',
          password: '',
        });
      }
      setServers(newServers);
    } else if (servers.length > count) {
      setServers(servers.slice(0, count));
    }
  }, [serverCount]);

  const loadInitialData = async () => {
    try {
      const [devicesRes, versionsRes, softwaresRes] = await Promise.all([
        deviceTypeApi.getList({ page: 1, pageSize: 100 }),
        versionApi.getList({ page: 1, pageSize: 100 }),
        resourceTypeApi.getList({ page: 1, pageSize: 100, category: 'software' }),
      ]);
      setDeviceTypes(devicesRes?.data || []);
      setVersions(versionsRes?.data || []);
      setSoftwares(softwaresRes?.data || []);
    } catch (error) {
      console.error('加载数据失败:', error);
      // Set empty arrays to prevent undefined errors
      setDeviceTypes([]);
      setVersions([]);
      setSoftwares([]);
    } finally {
      setLoading(false);
    }
  };

  const handleServerChange = (id: string, field: keyof ServerInfo, value: string) => {
    setServers(servers.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const handleSoftwareToggle = (softwareId: string) => {
    setSelectedSoftwares(prev =>
      prev.includes(softwareId)
        ? prev.filter(id => id !== softwareId)
        : [...prev, softwareId]
    );
  };

  const handleStartFlash = async () => {
    const tasks: FlashTask[] = [];
    
    if (mode === 'robot') {
      const task: FlashTask = {
        id: Date.now().toString(),
        mode,
        deviceTypeId: selectedDeviceType,
        versionId: selectedVersion,
        deviceSerialNumber: serialNumber,
        deviceIp,
        devicePort,
        deviceUsername,
        status: 'pending',
        progress: 0,
        currentStep: '准备开始...',
        startTime: new Date().toISOString(),
        logs: [`[${new Date().toLocaleTimeString()}] 任务创建成��`],
        canCancel: true,
        canResume: false,
      };
      tasks.push(task);
    } else {
      // 为每台服务器创建任务
      servers.forEach((server, index) => {
        const task: FlashTask = {
          id: `${Date.now()}_${index}`,
          mode,
          softwareIds: selectedSoftwares,
          deviceIp: server.ip,
          devicePort: server.port,
          deviceUsername: server.username,
          status: 'pending',
          progress: 0,
          currentStep: '准备开始...',
          startTime: new Date().toISOString(),
          logs: [
            `[${new Date().toLocaleTimeString()}] 任务创建成功`,
            `[${new Date().toLocaleTimeString()}] 目标服务器: ${server.ip}:${server.port}`,
          ],
          canCancel: true,
          canResume: false,
        };
        tasks.push(task);
      });
    }

    // 创建任务并跳转
    for (const task of tasks) {
      await taskApi.create(task);
      setTimeout(() => simulateTask(task), 500);
    }

    navigate('/tasks');
  };

  const simulateTask = (task: FlashTask) => {
    let progress = 0;
    const steps = mode === 'robot' 
      ? ['连接设备', '验证身份', '准备固件', '写入固件', '验证完整性', '重启设备']
      : ['连接服务器', '检查环境', '下载软件包', '安装软件', '配置服务', '启动服务'];

    const interval = setInterval(() => {
      progress += 16;
      const stepIndex = Math.floor((progress / 100) * steps.length);
      
      const updatedTask = {
        ...task,
        progress: Math.min(progress, 100),
        currentStep: steps[Math.min(stepIndex, steps.length - 1)] || '完成',
        status: progress >= 100 ? 'success' : 'running',
        endTime: progress >= 100 ? new Date().toISOString() : undefined,
        logs: [
          ...task.logs,
          `[${new Date().toLocaleTimeString()}] ${steps[Math.min(stepIndex, steps.length - 1)]}...`,
        ],
      } as FlashTask;

      taskWebSocket.simulateTaskProgress(task.id, updatedTask);

      if (progress >= 100) {
        clearInterval(interval);
        taskWebSocket.simulateTaskProgress(task.id, {
          ...updatedTask,
          logs: [...updatedTask.logs, `[${new Date().toLocaleTimeString()}] ✓ 任务完成`],
        });
      }
    }, 1500);
  };

  const canStartFlash = () => {
    if (mode === 'robot') {
      return selectedDeviceType && selectedVersion && serialNumber && 
             deviceIp && devicePort && deviceUsername && devicePassword;
    } else {
      return selectedSoftwares.length > 0 && 
             servers.every(s => s.ip && s.port && s.username && s.password);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-slate-900 mb-1">刷机操作</h1>
        <p className="text-slate-600 text-sm">选择刷机模式并配置相关参数</p>
      </div>

      <Card className="shadow-lg border-slate-200">
        <CardHeader>
          <CardTitle>选择刷机模式</CardTitle>
          <CardDescription className="text-sm">选择机器人刷机或服务器批量部署</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={mode} onValueChange={(v) => setMode(v as FlashMode)} className="w-full">
            <TabsList className="grid w-full grid-cols-2 h-auto p-1">
              <TabsTrigger value="robot" className="flex items-center gap-2 py-3">
                <Bot className="w-4 h-4" />
                机器人刷机
              </TabsTrigger>
              <TabsTrigger value="server" className="flex items-center gap-2 py-3">
                <Server className="w-4 h-4" />
                服务器部署
              </TabsTrigger>
            </TabsList>

            <TabsContent value="robot" className="space-y-6 mt-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-slate-700">机器人配置</h3>
                  
                  <div className="space-y-2">
                    <Label>机器类型</Label>
                    <Select value={selectedDeviceType} onValueChange={setSelectedDeviceType}>
                      <SelectTrigger>
                        <SelectValue placeholder="选择机器类型" />
                      </SelectTrigger>
                      <SelectContent>
                        {deviceTypes.map((device) => (
                          <SelectItem key={device.id} value={device.id}>
                            {device.name} ({device.model})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>固件版本</Label>
                    <Select value={selectedVersion} onValueChange={setSelectedVersion}>
                      <SelectTrigger>
                        <SelectValue placeholder="选择固件版本" />
                      </SelectTrigger>
                      <SelectContent>
                        {versions.map((version) => (
                          <SelectItem key={version.id} value={version.id}>
                            <div className="flex items-center gap-2">
                              {version.versionNumber}
                              <span className="text-xs text-muted-foreground">
                                {version.fileSize}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>设备序列号</Label>
                    <Input
                      value={serialNumber}
                      onChange={(e) => setSerialNumber(e.target.value)}
                      placeholder="例如：SN20240001"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-slate-700">设备连接信息</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>设备IP</Label>
                      <Input
                        value={deviceIp}
                        onChange={(e) => setDeviceIp(e.target.value)}
                        placeholder="192.168.1.100"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>端口</Label>
                      <Input
                        value={devicePort}
                        onChange={(e) => setDevicePort(e.target.value)}
                        placeholder="22"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>用户名</Label>
                      <Input
                        value={deviceUsername}
                        onChange={(e) => setDeviceUsername(e.target.value)}
                        placeholder="root"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>密码</Label>
                      <Input
                        type="password"
                        value={devicePassword}
                        onChange={(e) => setDevicePassword(e.target.value)}
                        placeholder="密码"
                      />
                    </div>
                  </div>

                  {selectedVersion && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-2 text-sm mt-4">
                      <div className="flex items-center gap-2 text-blue-900">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>版本信息</span>
                      </div>
                      {(() => {
                        const version = versions.find(v => v.id === selectedVersion);
                        return version ? (
                          <div className="text-blue-800 space-y-1">
                            <p>版本: {version.versionNumber}</p>
                            <p>大小: {version.fileSize}</p>
                            <p>描述: {version.description}</p>
                          </div>
                        ) : null;
                      })()}
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="server" className="space-y-6 mt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-slate-700">服务器数量</h3>
                  <Select value={serverCount} onValueChange={(v) => setServerCount(v as any)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 台</SelectItem>
                      <SelectItem value="3">3 台</SelectItem>
                      <SelectItem value="5">5 台</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-4">
                  {servers.map((server, index) => (
                    <Card key={server.id} className="bg-slate-50">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">服务器 {index + 1}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <Label className="text-xs">服务器IP</Label>
                            <Input
                              value={server.ip}
                              onChange={(e) => handleServerChange(server.id, 'ip', e.target.value)}
                              placeholder="192.168.1.200"
                              size="sm"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs">SSH端口</Label>
                            <Input
                              value={server.port}
                              onChange={(e) => handleServerChange(server.id, 'port', e.target.value)}
                              placeholder="22"
                              size="sm"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <Label className="text-xs">用户名</Label>
                            <Input
                              value={server.username}
                              onChange={(e) => handleServerChange(server.id, 'username', e.target.value)}
                              placeholder="root"
                              size="sm"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs">密码</Label>
                            <Input
                              type="password"
                              value={server.password}
                              onChange={(e) => handleServerChange(server.id, 'password', e.target.value)}
                              placeholder="密码"
                              size="sm"
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="space-y-3">
                  <h3 className="text-slate-700">选择要安装的软件</h3>
                  
                  <div className="grid md:grid-cols-2 gap-3 max-h-80 overflow-y-auto border rounded-lg p-4">
                    {softwares.map((software) => (
                      <div
                        key={software.id}
                        className="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-50 transition-colors border"
                      >
                        <Checkbox
                          id={software.id}
                          checked={selectedSoftwares.includes(software.id)}
                          onCheckedChange={() => handleSoftwareToggle(software.id)}
                        />
                        <Label
                          htmlFor={software.id}
                          className="flex-1 cursor-pointer flex items-center justify-between"
                        >
                          <div>
                            <p className="text-sm">{software.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {software.type}
                            </p>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {software.version}
                          </Badge>
                        </Label>
                      </div>
                    ))}
                  </div>

                  {selectedSoftwares.length > 0 && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-900">
                        已选择 {selectedSoftwares.length} 个软件，将在 {serverCount} 台服务器上安装
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-6 flex justify-end">
            <Button
              size="lg"
              onClick={handleStartFlash}
              disabled={!canStartFlash()}
              className="min-w-40"
            >
              <Zap className="w-4 h-4 mr-2" />
              开始刷机
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}