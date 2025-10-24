// src/pages/Task.tsx
// 受験管理画面（Task画面）
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useWorkspace } from '../hooks/useWorkspace';
import { useWorkspaceMembers } from '../hooks/useWorkspaceMembers';
import { PageLayout } from '../components/common/PageLayout';
import { LoadingError } from '../components/common/LoadingError';
import { ActionButtons } from '../components/common/ActionButtons';
import type { Task as TaskType, ExamTaskInfo } from '../types/task';
import './Task.scss';

type FilterBy = 'all' | '受験' | '見送り';
type SortOrder = 'asc' | 'desc';

const Task: React.FC = () => {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const { workspaceName, workspaceOwner } = useWorkspace(workspaceId);

  const [examTasks, setExamTasks] = useState<ExamTaskInfo[]>([]);
  const [filterBy, setFilterBy] = useState<FilterBy>('all');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // ワークスペースメンバー取得
  const { members: workspaceMembers } = useWorkspaceMembers(workspaceId);

  // ...

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // 受験情報を取得
const { data: examData, error: examError } = await supabase
    .from('exam_info')
    .select(`
        id,
        school_id,
        schools!inner(school_code, name),
        exam_candidate_sign,
        exam_start,
        exam_end,
        exam_venue,
        exam_subjects,
        application_start,
        application_end,
        application_deadline,
        application_materials,
        fee_deadline,
        announcement_time,
        enrollment_start,
        enrollment_end,
        admission_fee_deadline
    `)
    .eq('workspace_id', workspaceId)
    .order('exam_start', { ascending: true });

      if (examError) throw examError;

      // 各受験情報に紐づくタスクを取得
      const examIds = examData.map((exam: any) => exam.id);
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select(`
          id,
          exam_info_id,
          task_type,
          assigned_to,
          is_completed,
          completed_at
        `)
        .in('exam_info_id', examIds);

      if (tasksError) throw tasksError;

      // タスクに担当者名を追加
      const tasksWithUsername = tasksData.map((task: any) => {
        const member = members.find(m => m.id === task.assigned_to);
        return {
          ...task,
          assigned_username: member ? member.username : null
        };
      });

      // 受験情報とタスクを結合
      const examTasksData: ExamTaskInfo[] = examData.map((exam: any) => {
        const examTasks = tasksWithUsername.filter((task: any) => task.exam_info_id === exam.id);
        return {
          id: exam.id,
          school_id: exam.school_id,
          school_code: exam.schools.code,
          school_name: exam.schools.name,
          exam_candidate_sign: exam.exam_candidate_sign,
          exam_start: exam.exam_start,
          exam_end: exam.exam_end,
          exam_venue: exam.exam_venue,
          exam_subjects: exam.exam_subjects,
          application_start: exam.application_start,
          application_end: exam.application_end,
          application_deadline: exam.application_deadline,
          application_materials: exam.application_materials,
          fee_deadline: exam.fee_deadline,
          announcement_time: exam.announcement_time,
          enrollment_start: exam.enrollment_start,
          enrollment_end: exam.enrollment_end,
          admission_fee_deadline: exam.admission_fee_deadline,
          tasks: examTasks
        };
      });

      setExamTasks(examTasksData);
    } catch (err: any) {
      console.error('データ取得エラー:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignTask = async (examInfoId: string, taskType: string, userId: string | null) => {
    try {
        // 担当者のユーザー名を取得
        const assignedUsername = userId 
        ? workspaceMembers.find(m => m.id === userId)?.username || null
        : null;

        // 既存のタスクを確認
        const { data: existingTask, error: fetchError } = await supabase
        .from('tasks')
        .select('id')
        .eq('exam_info_id', examInfoId)
        .eq('task_type', taskType)
        .single();

        let taskId: string;

        if (existingTask) {
        // 更新
        const { error: updateError } = await supabase
            .from('tasks')
            .update({ assigned_to: userId })
            .eq('id', existingTask.id);

        if (updateError) throw updateError;
        taskId = existingTask.id;
        } else {
        // 新規作成
        const { data: newTask, error: insertError } = await supabase
            .from('tasks')
            .insert({
            exam_info_id: examInfoId,
            task_type: taskType,
            assigned_to: userId,
            is_completed: false
            })
            .select('id')
            .single();

        if (insertError) throw insertError;
        taskId = newTask.id;
        }

        // ローカル状態を更新（画面全体を再取得しない）
        setExamTasks(prevExams => 
        prevExams.map(exam => {
            if (exam.id === examInfoId) {
            // 該当するexamのtasksを更新
            const existingTaskIndex = exam.tasks.findIndex(t => t.task_type === taskType);
            
            if (existingTaskIndex >= 0) {
                // 既存タスクを更新
                const updatedTasks = [...exam.tasks];
                updatedTasks[existingTaskIndex] = {
                ...updatedTasks[existingTaskIndex],
                assigned_to: userId,
                assigned_username: assignedUsername
                };
                return { ...exam, tasks: updatedTasks };
            } else {
                // 新規タスクを追加
                const newTask: TaskType = {
                id: taskId,
                exam_info_id: examInfoId,
                task_type: taskType as TaskType['task_type'],
                assigned_to: userId,
                assigned_username: assignedUsername,
                is_completed: false,
                completed_at: null
                };
                return { ...exam, tasks: [...exam.tasks, newTask] };
            }
            }
            return exam;
        })
        );
    } catch (err: any) {
        console.error('担当者設定エラー:', err);
        alert('担当者の設定に失敗しました');
    }
    };

  const handleToggleComplete = async (examInfoId: string, taskType: string, currentStatus: boolean) => {
    try {
        const newStatus = !currentStatus;
        const completedAt = newStatus ? new Date().toISOString() : null;

        // 既存のタスクを確認
        const { data: existingTask, error: fetchError } = await supabase
        .from('tasks')
        .select('id')
        .eq('exam_info_id', examInfoId)
        .eq('task_type', taskType)
        .single();

        let taskId: string;

        if (existingTask) {
        // 更新
        const { error: updateError } = await supabase
            .from('tasks')
            .update({
            is_completed: newStatus,
            completed_at: completedAt
            })
            .eq('id', existingTask.id);

        if (updateError) throw updateError;
        taskId = existingTask.id;
        } else {
        // 新規作成
        const { data: newTask, error: insertError } = await supabase
            .from('tasks')
            .insert({
            exam_info_id: examInfoId,
            task_type: taskType,
            is_completed: newStatus,
            completed_at: completedAt
            })
            .select('id')
            .single();

        if (insertError) throw insertError;
        taskId = newTask.id;
        }

        // ローカル状態を更新（画面全体を再取得しない）
        setExamTasks(prevExams => 
        prevExams.map(exam => {
            if (exam.id === examInfoId) {
            // 該当するexamのtasksを更新
            const existingTaskIndex = exam.tasks.findIndex(t => t.task_type === taskType);
            
            if (existingTaskIndex >= 0) {
                // 既存タスクを更新
                const updatedTasks = [...exam.tasks];
                updatedTasks[existingTaskIndex] = {
                ...updatedTasks[existingTaskIndex],
                is_completed: newStatus,
                completed_at: completedAt
                };
                return { ...exam, tasks: updatedTasks };
            } else {
                // 新規タスクを追加
                const newTask: TaskType = {
                id: taskId,
                exam_info_id: examInfoId,
                task_type: taskType as TaskType['task_type'],
                assigned_to: null,
                assigned_username: null,
                is_completed: newStatus,
                completed_at: completedAt
                };
                return { ...exam, tasks: [...exam.tasks, newTask] };
            }
            }
            return exam;
        })
        );
    } catch (err: any) {
        console.error('完了状態更新エラー:', err);
        alert('完了状態の更新に失敗しました');
    }
    };

  const getFilteredAndSortedExams = () => {
    let filtered = examTasks;

    // フィルター
    if (filterBy !== 'all') {
      filtered = filtered.filter(exam => exam.exam_candidate_sign === filterBy);
    }

    // ソート
    const sorted = [...filtered].sort((a, b) => {
      const dateA = new Date(a.exam_start).getTime();
      const dateB = new Date(b.exam_start).getTime();
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });

    return sorted;
  };

  const getTaskForType = (tasks: TaskType[], taskType: string): TaskType | undefined => {
    return tasks.find(task => task.task_type === taskType);
  };

  const formatDateTime = (datetime: string | null) => {
    if (!datetime) return '未設定';
    const date = new Date(datetime);
    return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  const formatDate = (date: string | null) => {
    if (!date) return '未設定';
    const d = new Date(date);
    return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;
  };

  const formatTime = (datetime: string) => {
    const date = new Date(datetime);
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  const getTaskLabel = (taskType: string): string => {
    const labels: { [key: string]: string } = {
      application: '受験申込',
      fee_payment: '受験料支払',
      announcement: '合格発表',
      enrollment: '入学申込',
      admission_fee: '入学金支払'
    };
    return labels[taskType] || taskType;
  };

  if (loading) {
    return (
      <PageLayout
        workspaceName={workspaceName}
        workspaceOwner={workspaceOwner}
        isMenuOpen={isMenuOpen}
        onMenuToggle={() => setIsMenuOpen(!isMenuOpen)}
        onMenuClose={() => setIsMenuOpen(false)}
        workspaceId={workspaceId!}
      >
        <LoadingError loading={loading} error={null} />
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout
        workspaceName={workspaceName}
        workspaceOwner={workspaceOwner}
        isMenuOpen={isMenuOpen}
        onMenuToggle={() => setIsMenuOpen(!isMenuOpen)}
        onMenuClose={() => setIsMenuOpen(false)}
        workspaceId={workspaceId!}
      >
        <LoadingError loading={false} error={error} />
      </PageLayout>
    );
  }

  return (
    <PageLayout
      workspaceName={workspaceName}
      workspaceOwner={workspaceOwner}
      isMenuOpen={isMenuOpen}
      onMenuToggle={() => setIsMenuOpen(!isMenuOpen)}
      onMenuClose={() => setIsMenuOpen(false)}
      workspaceId={workspaceId!}
    >
      <div className="task-page">
        <section className="task-section">
          <div className="section-title">
            <span>受験管理</span>
            <div className="controls">
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value as FilterBy)}
                className="filter-select"
              >
                <option value="all">すべて</option>
                <option value="受験">受験</option>
                <option value="見送り">見送り</option>
              </select>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as SortOrder)}
                className="sort-select"
              >
                <option value="asc">受験日（早→遅）</option>
                <option value="desc">受験日（遅→早）</option>
              </select>
            </div>
          </div>

          {getFilteredAndSortedExams().length === 0 ? (
            <div className="empty-message">
              <p>受験情報はまだ登録されていません</p>
            </div>
          ) : (
            <div className="task-cards">
              {getFilteredAndSortedExams().map((exam) => (
                <div key={exam.id} className="task-card">
                  <div className="card-header">
                    <h3 className="school-name">{exam.school_name}</h3>
                    {exam.exam_candidate_sign && (
                      <span className={`status-badge ${exam.exam_candidate_sign === '受験' ? 'status-exam' : 'status-skip'}`}>
                        {exam.exam_candidate_sign}
                      </span>
                    )}
                  </div>

                  <div className="exam-info-section">
                    <h4 className="subsection-title">受験</h4>
                    <div className="info-grid">
                      <div className="info-item">
                        <span className="label">受験時間</span>
                        <span className="value">
                          {formatDateTime(exam.exam_start)} ～ {formatTime(exam.exam_end)}
                        </span>
                      </div>
                      <div className="info-item">
                        <span className="label">受験会場</span>
                        <span className="value">{exam.exam_venue}</span>
                      </div>
                      <div className="info-item">
                        <span className="label">受験科目</span>
                        <span className="value">{exam.exam_subjects}</span>
                      </div>
                    </div>
                  </div>

                  {/* 受験申込タスク */}
                  <div className="task-section-item">
                    <div className="task-header">
                      <h4 className="subsection-title">受験申込</h4>
                      <div className="task-controls">
                        <select
                          value={getTaskForType(exam.tasks, 'application')?.assigned_to || ''}
                          onChange={(e) => handleAssignTask(exam.id, 'application', e.target.value || null)}
                          className="assign-select"
                        >
                          <option value="">担当者未設定</option>
                          {workspaceMembers.map(member => (
                            <option key={member.id} value={member.id}>{member.username}</option>
                          ))}
                        </select>
                        <button
                          className={`complete-btn ${getTaskForType(exam.tasks, 'application')?.is_completed ? 'completed' : ''}`}
                          onClick={() => handleToggleComplete(
                            exam.id,
                            'application',
                            getTaskForType(exam.tasks, 'application')?.is_completed || false
                          )}
                        >
                          {getTaskForType(exam.tasks, 'application')?.is_completed ? '✓ 完了' : '未完了'}
                        </button>
                      </div>
                    </div>
                    <div className="info-grid">
                      <div className="info-item">
                        <span className="label">申込期間</span>
                        <span className="value">
                          {formatDate(exam.application_start)} ～ {formatDate(exam.application_end)}
                        </span>
                      </div>
                      {exam.application_deadline && (
                        <div className="info-item">
                          <span className="label">申込期限</span>
                          <span className="value">{formatDateTime(exam.application_deadline)}</span>
                        </div>
                      )}
                      {exam.application_materials && (
                        <div className="info-item">
                          <span className="label">必要資材</span>
                          <span className="value">{exam.application_materials}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 受験料支払タスク */}
                  <div className="task-section-item">
                    <div className="task-header">
                      <h4 className="subsection-title">受験料支払</h4>
                      <div className="task-controls">
                        <select
                          value={getTaskForType(exam.tasks, 'fee_payment')?.assigned_to || ''}
                          onChange={(e) => handleAssignTask(exam.id, 'fee_payment', e.target.value || null)}
                          className="assign-select"
                        >
                          <option value="">担当者未設定</option>
                          {workspaceMembers.map(member => (
                            <option key={member.id} value={member.id}>{member.username}</option>
                          ))}
                        </select>
                        <button
                          className={`complete-btn ${getTaskForType(exam.tasks, 'fee_payment')?.is_completed ? 'completed' : ''}`}
                          onClick={() => handleToggleComplete(
                            exam.id,
                            'fee_payment',
                            getTaskForType(exam.tasks, 'fee_payment')?.is_completed || false
                          )}
                        >
                          {getTaskForType(exam.tasks, 'fee_payment')?.is_completed ? '✓ 完了' : '未完了'}
                        </button>
                      </div>
                    </div>
                    <div className="info-grid">
                      {exam.fee_deadline && (
                        <div className="info-item">
                          <span className="label">支払期限</span>
                          <span className="value">{formatDateTime(exam.fee_deadline)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 合格発表タスク */}
                  <div className="task-section-item">
                    <div className="task-header">
                      <h4 className="subsection-title">合格発表</h4>
                      <div className="task-controls">
                        <select
                          value={getTaskForType(exam.tasks, 'announcement')?.assigned_to || ''}
                          onChange={(e) => handleAssignTask(exam.id, 'announcement', e.target.value || null)}
                          className="assign-select"
                        >
                          <option value="">担当者未設定</option>
                          {workspaceMembers.map(member => (
                            <option key={member.id} value={member.id}>{member.username}</option>
                          ))}
                        </select>
                        <button
                          className={`complete-btn ${getTaskForType(exam.tasks, 'announcement')?.is_completed ? 'completed' : ''}`}
                          onClick={() => handleToggleComplete(
                            exam.id,
                            'announcement',
                            getTaskForType(exam.tasks, 'announcement')?.is_completed || false
                          )}
                        >
                          {getTaskForType(exam.tasks, 'announcement')?.is_completed ? '✓ 完了' : '未完了'}
                        </button>
                      </div>
                    </div>
                    <div className="info-grid">
                      {exam.announcement_time && (
                        <div className="info-item">
                          <span className="label">発表時刻</span>
                          <span className="value">{formatDateTime(exam.announcement_time)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 入学申込タスク */}
                  <div className="task-section-item">
                    <div className="task-header">
                      <h4 className="subsection-title">入学申込</h4>
                      <div className="task-controls">
                        <select
                          value={getTaskForType(exam.tasks, 'enrollment')?.assigned_to || ''}
                          onChange={(e) => handleAssignTask(exam.id, 'enrollment', e.target.value || null)}
                          className="assign-select"
                        >
                          <option value="">担当者未設定</option>
                          {workspaceMembers.map(member => (
                            <option key={member.id} value={member.id}>{member.username}</option>
                          ))}
                        </select>
                        <button
                          className={`complete-btn ${getTaskForType(exam.tasks, 'enrollment')?.is_completed ? 'completed' : ''}`}
                          onClick={() => handleToggleComplete(
                            exam.id,
                            'enrollment',
                            getTaskForType(exam.tasks, 'enrollment')?.is_completed || false
                          )}
                        >
                          {getTaskForType(exam.tasks, 'enrollment')?.is_completed ? '✓ 完了' : '未完了'}
                        </button>
                      </div>
                    </div>
                    <div className="info-grid">
                      {exam.enrollment_start && exam.enrollment_end && (
                        <div className="info-item">
                          <span className="label">申込期間</span>
                          <span className="value">
                            {formatDateTime(exam.enrollment_start)} ～ {formatTime(exam.enrollment_end)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 入学金支払タスク */}
                  <div className="task-section-item">
                    <div className="task-header">
                      <h4 className="subsection-title">入学金支払</h4>
                      <div className="task-controls">
                        <select
                          value={getTaskForType(exam.tasks, 'admission_fee')?.assigned_to || ''}
                          onChange={(e) => handleAssignTask(exam.id, 'admission_fee', e.target.value || null)}
                          className="assign-select"
                        >
                          <option value="">担当者未設定</option>
                          {workspaceMembers.map(member => (
                            <option key={member.id} value={member.id}>{member.username}</option>
                          ))}
                        </select>
                        <button
                          className={`complete-btn ${getTaskForType(exam.tasks, 'admission_fee')?.is_completed ? 'completed' : ''}`}
                          onClick={() => handleToggleComplete(
                            exam.id,
                            'admission_fee',
                            getTaskForType(exam.tasks, 'admission_fee')?.is_completed || false
                          )}
                        >
                          {getTaskForType(exam.tasks, 'admission_fee')?.is_completed ? '✓ 完了' : '未完了'}
                        </button>
                      </div>
                    </div>
                    <div className="info-grid">
                      {exam.admission_fee_deadline && (
                        <div className="info-item">
                          <span className="label">支払期限</span>
                          <span className="value">{formatDateTime(exam.admission_fee_deadline)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="card-actions">
                    <button
                      className="btn btn-exam"
                      onClick={() => window.location.href = `/workspace/${workspaceId}/school/${exam.school_id}/exam`}
                    >
                      受験情報
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="task-section action-buttons-section">
          <ActionButtons
            workspaceId={workspaceId!}
            buttons={[
              {
                label: 'Home',
                path: `/workspace/${workspaceId}`,
                variant: 'home'
              }
            ]}
          />
        </section>
      </div>
    </PageLayout>
  );
};

export default Task;