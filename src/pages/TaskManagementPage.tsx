import { useEffect, useState } from "react";
import { FlashTask } from "../types";
import { taskApi } from "../services/api";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import { ScrollArea } from "../components/ui/scroll-area";
import {
  Pause,
  Play,
  XCircle,
  CheckCircle2,
  AlertCircle,
  Clock,
  Loader2,
  Download,
  ArrowLeft,
  Server,
  Cpu,
  RefreshCw,
  Eye,
  EyeOff,
} from "lucide-react";
import { cn } from "../components/ui/utils";
import { Pagination } from "../components/Pagination";
import { useTaskStore } from "../store/taskStore";
import { useTaskListQuery } from "../features/resource/useResourceQueries";

export function TaskManagementPage() {
  const { setFocusedTaskId, upsertTask } = useTaskStore();
  const [selectedTask, setSelectedTask] = useState<FlashTask | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showRealtimeLogs, setShowRealtimeLogs] = useState(true);

  const tasksQuery = useTaskListQuery({ page, pageSize });
  const { data: pagedTasks, refetch } = tasksQuery;
  const total = pagedTasks?.total ?? 0;



  // 模拟任务状态更新
  useEffect(() => {
    const interval = setInterval(() => {
      if (selectedTask && selectedTask.status === 'running' && showDetail) {
        const updatedTask = {
          ...selectedTask,
          progress: Math.min(selectedTask.progress + Math.random() * 5, 100),
        };
        
        if (updatedTask.progress >= 100) {
          updatedTask.status = 'success';
          updatedTask.currentStep = '任务完成';
          updatedTask.endTime = new Date().toISOString();
          updatedTask.canCancel = false;
        }
        
        // 模拟新日志添加
        if (Math.random() > 0.7) {
          const newLog = `[${new Date().toLocaleString()}] ${updatedTask.currentStep}... ${Math.round(updatedTask.progress)}%`;
          updatedTask.logs = [...updatedTask.logs, newLog];
        }
        
        setSelectedTask(updatedTask);
        upsertTask(updatedTask);
        refetch({ throwOnError: false, cancelRefetch: false });
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [selectedTask, showDetail, upsertTask, refetch]);



  const handleViewDetails = (task: FlashTask) => {
    setFocusedTaskId(task.id);
    setSelectedTask(task);
    setShowDetail(true);
  };

  const handleBackToList = () => {
    setShowDetail(false);
    setSelectedTask(null);
  };

  const handlePauseTask = async (taskId: string) => {
    try {
      const updatedTask = await taskApi.updateStatus(taskId, 'paused');
      if (selectedTask?.id === taskId) {
        setSelectedTask({
          ...selectedTask,
          status: 'paused',
          currentStep: '已暂停',
          canResume: true,
          canCancel: false,
        });
      }
      upsertTask(updatedTask);
      tasksQuery.refetch();
    } catch (error) {
      console.error('暂停任务失败:', error);
    }
  };

  const handleResumeTask = async (taskId: string) => {
    try {
      const updatedTask = await taskApi.updateStatus(taskId, 'running');
      if (selectedTask?.id === taskId) {
        setSelectedTask({
          ...selectedTask,
          status: 'running',
          currentStep: '执行中...',
          canResume: false,
          canCancel: true,
        });
      }
      upsertTask(updatedTask);
      tasksQuery.refetch();
    } catch (error) {
      console.error('恢复任务失败:', error);
    }
  };

  const handleCancelTask = async (taskId: string) => {
    try {
      const updatedTask = await taskApi.updateStatus(taskId, 'cancelled');
      if (selectedTask?.id === taskId) {
        setSelectedTask({
          ...selectedTask,
          status: 'cancelled',
          currentStep: '已取消',
          canCancel: false,
          canResume: false,
        });
      }
      upsertTask(updatedTask);
      tasksQuery.refetch();
    } catch (error) {
      console.error('取消任务失败:', error);
    }
  };

  const getStatusBadge = (status: FlashTask['status']) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="secondary" className="gap-1">
            <Clock className="w-3 h-3" />
            等待中
          </Badge>
        );
      case 'running':
        return (
          <Badge className="bg-blue-500 gap-1">
            <Loader2 className="w-3 h-3 animate-spin" />
            进行中
          </Badge>
        );
      case 'paused':
        return (
          <Badge variant="outline" className="gap-1">
            <Pause className="w-3 h-3" />
            已暂停
          </Badge>
        );
      case 'success':
        return (
          <Badge className="bg-green-500 gap-1">
            <CheckCircle2 className="w-3 h-3" />
            成功
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="destructive" className="gap-1">
            <AlertCircle className="w-3 h-3" />
            失败
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge variant="secondary" className="gap-1">
            <XCircle className="w-3 h-3" />
            已取消
          </Badge>
        );
    }
  };

  const getModeName = (mode: FlashTask['mode']) => {
    return mode === 'robot' ? '刷机器人' : '刷服务器';
  };

  const getModeIcon = (mode: FlashTask['mode']) => {
    return mode === 'robot' ? <Cpu className="w-4 h-4" /> : <Server className="w-4 h-4" />;
  };

  const handleDownloadLog = (task: FlashTask) => {
    const logContent = task.logs.join('\n');
    const blob = new Blob([logContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const anchorElement = document.createElement('a');
    anchorElement.href = url;
    anchorElement.download = `task_${task.id}_${new Date().getTime()}.log`;
    document.body.appendChild(anchorElement);
    anchorElement.click();
    document.body.removeChild(anchorElement);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-slate-900 mb-1">任务管理</h1>
          <p className="text-slate-600 text-sm">
            {showDetail ? '任务详细信息' : '实时监控所有刷机任务的进度和状态'}
          </p>
        </div>
        <div className="flex items-center gap-2">

          <Button variant="outline" onClick={() => refetch()} size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            刷新
          </Button>
          {showDetail && (
            <Button variant="outline" onClick={handleBackToList}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回列表 (ESC)
            </Button>
          )}
        </div>
      </div>

      <Card className="shadow-lg border-slate-200">
        <CardContent className="pt-6">
          {!showDetail ? (
            // 任务列表视图
            <>
              {tasksQuery.isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
              ) : (pagedTasks?.data.length ?? 0) === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Clock className="w-16 h-16 mb-4" />
                  <p>暂无任务</p>
                  <p className="text-sm">创建新的刷机任务后将在此显示</p>
                </div>
              ) : (
                <>
                  <div className="grid gap-4 mb-4">
                    {pagedTasks?.data.map((task) => (
                      <Card
                        key={task.id}
                        className={cn(
                          'transition-all hover:shadow-lg cursor-pointer border-slate-200 hover:scale-[1.01]',
                          task.status === 'running' && 'border-blue-400 bg-blue-50/50 shadow-blue-100',
                          task.status === 'success' && 'border-green-400 bg-green-50/50 shadow-green-100',
                          task.status === 'failed' && 'border-red-400 bg-red-50/50 shadow-red-100',
                          task.status === 'paused' && 'border-yellow-400 bg-yellow-50/50 shadow-yellow-100'
                        )}
                        onClick={() => handleViewDetails(task)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                {getModeIcon(task.mode)}
                                <span className="font-medium">{getModeName(task.mode)}</span>
                                {getStatusBadge(task.status)}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {task.deviceIp}:{task.devicePort} • {task.deviceUsername}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              {task.status === 'running' && task.canCancel && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={(e: React.MouseEvent) => {
                                      e.stopPropagation();
                                      handlePauseTask(task.id);
                                    }}
                                  >
                                    <Pause className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={(e: React.MouseEvent) => {
                                      e.stopPropagation();
                                      handleCancelTask(task.id);
                                    }}
                                  >
                                    <XCircle className="w-4 h-4" />
                                  </Button>
                                </>
                              )}
                              {task.status === 'paused' && task.canResume && (
                                <Button
                                  size="sm"
                                  onClick={(e: React.MouseEvent) => {
                                    e.stopPropagation();
                                    handleResumeTask(task.id);
                                  }}
                                >
                                  <Play className="w-4 h-4" />
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e: React.MouseEvent) => {
                                  e.stopPropagation();
                                  handleViewDetails(task);
                                }}
                              >
                                详情
                              </Button>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">{task.currentStep}</span>
                              <span className="font-medium">{task.progress}%</span>
                            </div>
                            <Progress value={task.progress} className="h-2" />
                          </div>
                          <div className="text-xs text-muted-foreground mt-2">
                            开始时间: {new Date(task.startTime).toLocaleString()}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <Pagination
                    currentPage={page}
                    pageSize={pageSize}
                    total={total}
                    onPageChange={setPage}
                    onPageSizeChange={setPageSize}
                  />
                </>
              )}
            </>
          ) : (
            // 任务详情视图
            selectedTask && (
              <div className="space-y-6">
                {/* 基本信息 */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">任务ID:</span>
                    <span className="ml-2 font-mono text-xs">{selectedTask.id}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">模式:</span>
                    {getModeIcon(selectedTask.mode)}
                    <span>{getModeName(selectedTask.mode)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">状态:</span>
                    <span className="ml-2">{selectedTask.currentStep}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">设备:</span>
                    <span className="ml-2 font-mono">
                      {selectedTask.deviceIp}:{selectedTask.devicePort}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">用户名:</span>
                    <span className="ml-2">{selectedTask.deviceUsername}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">开始时间:</span>
                    <span className="ml-2">{new Date(selectedTask.startTime).toLocaleString()}</span>
                  </div>
                </div>

                {/* 进度条 */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>任务进度</span>
                    <span className="font-medium">{selectedTask.progress}%</span>
                  </div>
                  <Progress value={selectedTask.progress} className="h-3" />
                </div>

                {/* 控制按钮 */}
                <div className="flex flex-wrap gap-2">
                  {selectedTask.status === "running" && selectedTask.canCancel && (
                    <>
                      <Button
                        variant="outline"
                        onClick={() => handlePauseTask(selectedTask.id)}
                      >
                        <Pause className="w-4 h-4 mr-2" />
                        暂停
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => handleCancelTask(selectedTask.id)}
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        取消任务
                      </Button>
                    </>
                  )}
                  {selectedTask.status === "paused" && selectedTask.canResume && (
                    <Button onClick={() => handleResumeTask(selectedTask.id)}>
                      <Play className="w-4 h-4 mr-2" />
                      恢复
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => handleDownloadLog(selectedTask)}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    下载日志
                  </Button>
                </div>

                {/* 实时日志 - 扩大并延伸到右侧 */}
                <div className="space-y-2 -mx-8 px-8">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium">实时日志</h4>
                    <div className="flex items-center gap-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowRealtimeLogs(!showRealtimeLogs)}
                        className="text-xs"
                      >
                        {showRealtimeLogs ? <EyeOff className="w-3 h-3 mr-1" /> : <Eye className="w-3 h-3 mr-1" />}
                        {showRealtimeLogs ? "隐藏实时" : "显示实时"}
                      </Button>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span>实时更新中</span>
                      </div>
                    </div>
                  </div>
                  <ScrollArea className="h-96 border rounded-lg p-4 bg-slate-950 text-green-400 font-mono text-xs shadow-inner">
                    <div className="space-y-1">
                      {selectedTask.logs.length === 0 ? (
                        <p className="text-slate-500 italic">等待日志输出...</p>
                      ) : (
                        <>
                          {selectedTask.logs.map((log, index) => (
                            <div 
                              key={index} 
                              className={cn(
                                "mb-1 leading-relaxed",
                                index === selectedTask.logs.length - 1 && showRealtimeLogs && "text-green-300 font-medium animate-pulse"
                              )}
                            >
                              {log}
                            </div>
                          ))}
                          {showRealtimeLogs && selectedTask.status === 'running' && (
                            <div className="flex items-center gap-2 mt-3 text-green-300">
                              <Loader2 className="w-3 h-3 animate-spin" />
                              <span className="animate-pulse">{selectedTask.currentStep}...</span>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </ScrollArea>
                  <div className="text-xs text-muted-foreground flex justify-between">
                    <span>共 {selectedTask.logs.length} 条日志</span>
                    <span>提示: 按 Ctrl+R 刷新数据，ESC 返回列表</span>
                  </div>
                </div>
              </div>
            )
          )}
        </CardContent>
      </Card>
    </div>
  );
}