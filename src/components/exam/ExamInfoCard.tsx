// src/components/exam/ExamInfoCard.tsx
import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useForm } from '../../hooks/useForm'
import FormField from '../common/FormField'
import './ExamInfoCard.scss'

type TabType = 'difficulty' | 'application' | 'fee' | 'exam' | 'announcement' | 'enrollment' | 'admissionFee'

interface ExamInfo {
  id: string
  workspace_id: string
  school_id: string
  deviation_value: number
  judgment_date: string | null
  judgment_result: string | null
  exam_candidate_sign: string | null
  application_start: string | null
  application_end: string | null
  application_deadline: string | null
  application_method: string | null
  application_materials: string | null
  application_note: string | null
  fee_deadline: string | null
  fee_payment_method: string | null
  fee_amount: number | null
  fee_note: string | null
  exam_start: string
  exam_end: string
  exam_venue: string
  exam_subjects: string
  parent_waiting_area: string | null
  exam_note: string | null
  announcement_time: string | null
  announcement_method: string | null
  announcement_note: string | null
  enrollment_start: string | null
  enrollment_end: string | null
  enrollment_method: string | null
  enrollment_note: string | null
  admission_fee_deadline: string | null
  admission_fee_payment_method: string | null
  admission_fee_amount: number | null
  admission_fee_note: string | null
  created_at: string
  updated_at: string
}

interface FormData {
  deviationValue: string
  judgmentDate: string
  judgmentResult: string
  examCandidateSign: string
  applicationStart: string
  applicationEnd: string
  applicationDeadline: string
  applicationMethod: string
  applicationMaterials: string
  applicationNote: string
  feeDeadline: string
  feePaymentMethod: string
  feeAmount: string
  feeNote: string
  examStart: string
  examEnd: string
  examVenue: string
  examSubjects: string
  parentWaitingArea: string
  examNote: string
  announcementTime: string
  announcementMethod: string
  announcementNote: string
  enrollmentStart: string
  enrollmentEnd: string
  enrollmentMethod: string
  enrollmentNote: string
  admissionFeeDeadline: string
  admissionFeePaymentMethod: string
  admissionFeeAmount: string
  admissionFeeNote: string
}

interface Props {
  examInfo: ExamInfo
  onUpdated: () => void
  onDeleted: (id: string) => void
}

export default function ExamInfoCard({ examInfo, onUpdated, onDeleted }: Props) {
  const [isEditing, setIsEditing] = useState(false)
  const [activeTab, setActiveTab] = useState<TabType>('difficulty')
  const [error, setError] = useState<string | null>(null)

  const form = useForm<FormData>({
    initialValues: {
      deviationValue: examInfo.deviation_value.toString(),
      judgmentDate: examInfo.judgment_date || '',
      judgmentResult: examInfo.judgment_result || '',
      examCandidateSign: examInfo.exam_candidate_sign || '',
      applicationStart: examInfo.application_start || '',
      applicationEnd: examInfo.application_end || '',
      applicationDeadline: examInfo.application_deadline || '',
      applicationMethod: examInfo.application_method || '',
      applicationMaterials: examInfo.application_materials || '',
      applicationNote: examInfo.application_note || '',
      feeDeadline: examInfo.fee_deadline || '',
      feePaymentMethod: examInfo.fee_payment_method || '',
      feeAmount: examInfo.fee_amount?.toString() || '',
      feeNote: examInfo.fee_note || '',
      examStart: examInfo.exam_start,
      examEnd: examInfo.exam_end,
      examVenue: examInfo.exam_venue,
      examSubjects: examInfo.exam_subjects,
      parentWaitingArea: examInfo.parent_waiting_area || '',
      examNote: examInfo.exam_note || '',
      announcementTime: examInfo.announcement_time || '',
      announcementMethod: examInfo.announcement_method || '',
      announcementNote: examInfo.announcement_note || '',
      enrollmentStart: examInfo.enrollment_start || '',
      enrollmentEnd: examInfo.enrollment_end || '',
      enrollmentMethod: examInfo.enrollment_method || '',
      enrollmentNote: examInfo.enrollment_note || '',
      admissionFeeDeadline: examInfo.admission_fee_deadline || '',
      admissionFeePaymentMethod: examInfo.admission_fee_payment_method || '',
      admissionFeeAmount: examInfo.admission_fee_amount?.toString() || '',
      admissionFeeNote: examInfo.admission_fee_note || ''
    },
    validationRules: {
      deviationValue: { required: true, displayName: '偏差値' },
      examStart: { required: true, displayName: '受験開始時刻' },
      examEnd: { required: true, displayName: '受験終了時刻' },
      examVenue: { required: true, displayName: '受験会場' },
      examSubjects: { required: true, displayName: '受験科目' }
    }
  })

  const formatDateTime = (dateTime: string | null) => {
    if (!dateTime) return '-'
    return new Date(dateTime).toLocaleString('ja-JP')
  }

  const formatDate = (date: string | null) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('ja-JP')
  }

  const handleUpdate = async () => {
    if (!form.validateAll()) {
      setError('必須項目を入力してください')
      return
    }

    form.setSubmitting(true)
    setError(null)

    try {
      const { error: updateError } = await supabase
        .from('exam_info')
        .update({
          deviation_value: parseFloat(form.values.deviationValue),
          judgment_date: form.values.judgmentDate || null,
          judgment_result: form.values.judgmentResult || null,
          exam_candidate_sign: form.values.examCandidateSign || null,
          application_start: form.values.applicationStart || null,
          application_end: form.values.applicationEnd || null,
          application_deadline: form.values.applicationDeadline || null,
          application_method: form.values.applicationMethod || null,
          application_materials: form.values.applicationMaterials || null,
          application_note: form.values.applicationNote || null,
          fee_deadline: form.values.feeDeadline || null,
          fee_payment_method: form.values.feePaymentMethod || null,
          fee_amount: form.values.feeAmount ? parseInt(form.values.feeAmount) : null,
          fee_note: form.values.feeNote || null,
          exam_start: form.values.examStart,
          exam_end: form.values.examEnd,
          exam_venue: form.values.examVenue,
          exam_subjects: form.values.examSubjects,
          parent_waiting_area: form.values.parentWaitingArea || null,
          exam_note: form.values.examNote || null,
          announcement_time: form.values.announcementTime || null,
          announcement_method: form.values.announcementMethod || null,
          announcement_note: form.values.announcementNote || null,
          enrollment_start: form.values.enrollmentStart || null,
          enrollment_end: form.values.enrollmentEnd || null,
          enrollment_method: form.values.enrollmentMethod || null,
          enrollment_note: form.values.enrollmentNote || null,
          admission_fee_deadline: form.values.admissionFeeDeadline || null,
          admission_fee_payment_method: form.values.admissionFeePaymentMethod || null,
          admission_fee_amount: form.values.admissionFeeAmount ? parseInt(form.values.admissionFeeAmount) : null,
          admission_fee_note: form.values.admissionFeeNote || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', examInfo.id)

      if (updateError) throw updateError

      setIsEditing(false)
      onUpdated()
    } catch (err) {
      console.error('Error updating exam info:', err)
      setError('受験情報の更新に失敗しました')
    } finally {
      form.setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('この受験情報を削除してもよろしいですか？')) return
    onDeleted(examInfo.id)
  }

  if (isEditing) {
    return (
      <div className="exam-info-card editing">
        {error && <div className="error-message">{error}</div>}

        <div className="tab-menu">
          <button
            className={`tab-button ${activeTab === 'difficulty' ? 'active' : ''}`}
            onClick={() => setActiveTab('difficulty')}
          >
            難易度
          </button>
          <button
            className={`tab-button ${activeTab === 'application' ? 'active' : ''}`}
            onClick={() => setActiveTab('application')}
          >
            受験申込
          </button>
          <button
            className={`tab-button ${activeTab === 'fee' ? 'active' : ''}`}
            onClick={() => setActiveTab('fee')}
          >
            受験料支払
          </button>
          <button
            className={`tab-button ${activeTab === 'exam' ? 'active' : ''}`}
            onClick={() => setActiveTab('exam')}
          >
            受験
          </button>
          <button
            className={`tab-button ${activeTab === 'announcement' ? 'active' : ''}`}
            onClick={() => setActiveTab('announcement')}
          >
            合格発表
          </button>
          <button
            className={`tab-button ${activeTab === 'enrollment' ? 'active' : ''}`}
            onClick={() => setActiveTab('enrollment')}
          >
            入学申込
          </button>
          <button
            className={`tab-button ${activeTab === 'admissionFee' ? 'active' : ''}`}
            onClick={() => setActiveTab('admissionFee')}
          >
            入学金支払
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'difficulty' && (
            <div className="form-fields">
              <FormField type="number" label="偏差値" step="0.1" required {...form.getFieldProps('deviationValue')} />
              <FormField type="date" label="合否判定日" {...form.getFieldProps('judgmentDate')} />
              <FormField type="text" label="合否判定結果" {...form.getFieldProps('judgmentResult')} />
            </div>
          )}

          {activeTab === 'application' && (
            <div className="form-fields">
              <FormField
                type="select"
                label="受験候補サイン"
                options={[
                  { value: '', label: '選択してください' },
                  { value: '受験', label: '受験' },
                  { value: '見送り', label: '見送り' }
                ]}
                {...form.getFieldProps('examCandidateSign')}
              />
              <FormField type="date" label="受験申込期間（開始）" {...form.getFieldProps('applicationStart')} />
              <FormField type="date" label="受験申込期間（終了）" {...form.getFieldProps('applicationEnd')} />
              <FormField type="datetime-local" label="受験申込期限" {...form.getFieldProps('applicationDeadline')} />
              <FormField type="textarea" label="受験申込方法" rows={3} {...form.getFieldProps('applicationMethod')} />
              <FormField type="textarea" label="受験申込用資材" rows={3} {...form.getFieldProps('applicationMaterials')} />
              <FormField type="textarea" label="備考" rows={3} {...form.getFieldProps('applicationNote')} />
            </div>
          )}

          {activeTab === 'fee' && (
            <div className="form-fields">
              <FormField type="datetime-local" label="受験料支払期限" {...form.getFieldProps('feeDeadline')} />
              <FormField type="text" label="受験料支払方法" {...form.getFieldProps('feePaymentMethod')} />
              <FormField type="number" label="受験料（円）" {...form.getFieldProps('feeAmount')} />
              <FormField type="textarea" label="備考" rows={3} {...form.getFieldProps('feeNote')} />
            </div>
          )}

          {activeTab === 'exam' && (
            <div className="form-fields">
              <FormField type="datetime-local" label="受験時間（開始）" required {...form.getFieldProps('examStart')} />
              <FormField type="datetime-local" label="受験時間（終了）" required {...form.getFieldProps('examEnd')} />
              <FormField type="text" label="受験会場" required {...form.getFieldProps('examVenue')} />
              <FormField type="textarea" label="受験科目" rows={3} required {...form.getFieldProps('examSubjects')} />
              <FormField type="text" label="親の待機場所" {...form.getFieldProps('parentWaitingArea')} />
              <FormField type="textarea" label="備考" rows={3} {...form.getFieldProps('examNote')} />
            </div>
          )}

          {activeTab === 'announcement' && (
            <div className="form-fields">
              <FormField type="datetime-local" label="発表時刻" {...form.getFieldProps('announcementTime')} />
              <FormField type="text" label="発表方法" {...form.getFieldProps('announcementMethod')} />
              <FormField type="textarea" label="備考" rows={3} {...form.getFieldProps('announcementNote')} />
            </div>
          )}

          {activeTab === 'enrollment' && (
            <div className="form-fields">
              <FormField type="datetime-local" label="入学申込期間（開始）" {...form.getFieldProps('enrollmentStart')} />
              <FormField type="datetime-local" label="入学申込期間（終了）" {...form.getFieldProps('enrollmentEnd')} />
              <FormField type="text" label="入学申込方法" {...form.getFieldProps('enrollmentMethod')} />
              <FormField type="textarea" label="備考" rows={3} {...form.getFieldProps('enrollmentNote')} />
            </div>
          )}

          {activeTab === 'admissionFee' && (
            <div className="form-fields">
              <FormField type="datetime-local" label="入学金支払期限" {...form.getFieldProps('admissionFeeDeadline')} />
              <FormField type="text" label="入学金支払方法" {...form.getFieldProps('admissionFeePaymentMethod')} />
              <FormField type="number" label="入学金（円）" {...form.getFieldProps('admissionFeeAmount')} />
              <FormField type="textarea" label="備考" rows={3} {...form.getFieldProps('admissionFeeNote')} />
            </div>
          )}
        </div>

        <div className="card-actions">
        <button className="btn btn-cancel" onClick={() => setIsEditing(false)}>
            キャンセル
        </button>
        <button className="btn btn-submit" onClick={handleUpdate} disabled={form.isSubmitting}>
            {form.isSubmitting ? '更新中...' : '更新'}
        </button>
        </div>
      </div>
    )
  }

  return (
  <div className="exam-info-card">
    {/* 1. 難易度セクション */}
    <div className="card-section">
      <h3 className="section-title">難易度</h3>
      <dl className="info-list">
        <dt>偏差値</dt><dd>{examInfo.deviation_value}</dd>
        <dt>合否判定日</dt><dd>{formatDate(examInfo.judgment_date)}</dd>
        <dt>合否判定結果</dt><dd>{examInfo.judgment_result || '-'}</dd>
      </dl>
    </div>

    {/* 2. 受験セクション ← ここに移動 */}
    <div className="card-section">
      <h3 className="section-title">受験</h3>
      <dl className="info-list">
        <dt>受験時間</dt><dd>{formatDateTime(examInfo.exam_start)} ～ {formatDateTime(examInfo.exam_end)}</dd>
        <dt>受験会場</dt><dd>{examInfo.exam_venue}</dd>
        <dt>受験科目</dt><dd>{examInfo.exam_subjects}</dd>
        <dt>親の待機場所</dt><dd>{examInfo.parent_waiting_area || '-'}</dd>
        {examInfo.exam_note && <><dt>備考</dt><dd>{examInfo.exam_note}</dd></>}
      </dl>
    </div>

    {/* 3. 受験申込セクション */}
    <div className="card-section">
      <h3 className="section-title">受験申込</h3>
      <dl className="info-list">
        <dt>受験候補サイン</dt><dd>{examInfo.exam_candidate_sign || '-'}</dd>
        <dt>申込期間</dt><dd>{formatDate(examInfo.application_start)} ～ {formatDate(examInfo.application_end)}</dd>
        <dt>申込期限</dt><dd>{formatDateTime(examInfo.application_deadline)}</dd>
        <dt>申込方法</dt><dd>{examInfo.application_method || '-'}</dd>
        <dt>必要資材</dt><dd>{examInfo.application_materials || '-'}</dd>
        {examInfo.application_note && <><dt>備考</dt><dd>{examInfo.application_note}</dd></>}
      </dl>
    </div>

    {/* 4. 受験料支払セクション */}
    <div className="card-section">
      <h3 className="section-title">受験料支払</h3>
      <dl className="info-list">
        <dt>支払期限</dt><dd>{formatDateTime(examInfo.fee_deadline)}</dd>
        <dt>支払方法</dt><dd>{examInfo.fee_payment_method || '-'}</dd>
        <dt>受験料</dt><dd>{examInfo.fee_amount ? `¥${examInfo.fee_amount.toLocaleString()}` : '-'}</dd>
        {examInfo.fee_note && <><dt>備考</dt><dd>{examInfo.fee_note}</dd></>}
      </dl>
    </div>

{/* 5. 合格発表セクション */}
      <div className="card-section">
        <h3 className="section-title">合格発表</h3>
        <dl className="info-list">
          <dt>発表時刻</dt><dd>{formatDateTime(examInfo.announcement_time)}</dd>
          <dt>発表方法</dt><dd>{examInfo.announcement_method || '-'}</dd>
          {examInfo.announcement_note && <><dt>備考</dt><dd>{examInfo.announcement_note}</dd></>}
        </dl>
      </div>

{/* 6. 入学申込セクション */}
      <div className="card-section">
        <h3 className="section-title">入学申込</h3>
        <dl className="info-list">
          <dt>申込期間</dt><dd>{formatDateTime(examInfo.enrollment_start)} ～ {formatDateTime(examInfo.enrollment_end)}</dd>
          <dt>申込方法</dt><dd>{examInfo.enrollment_method || '-'}</dd>
          {examInfo.enrollment_note && <><dt>備考</dt><dd>{examInfo.enrollment_note}</dd></>}
        </dl>
      </div>

{/* 7. 入学金支払セクション */}
      <div className="card-section">
        <h3 className="section-title">入学金支払</h3>
        <dl className="info-list">
          <dt>支払期限</dt><dd>{formatDateTime(examInfo.admission_fee_deadline)}</dd>
          <dt>支払方法</dt><dd>{examInfo.admission_fee_payment_method || '-'}</dd>
          <dt>入学金</dt><dd>{examInfo.admission_fee_amount ? `¥${examInfo.admission_fee_amount.toLocaleString()}` : '-'}</dd>
          {examInfo.admission_fee_note && <><dt>備考</dt><dd>{examInfo.admission_fee_note}</dd></>}
        </dl>
      </div>

      <div className="card-section">
        <div className="info-row">
            <span className="label">更新日</span>
            <span className="value">{formatDate(examInfo.updated_at)}</span>
        </div>
        </div>

      <div className="card-actions">
        <button className="btn-edit" onClick={() => setIsEditing(true)}>
            編集
        </button>
        <button className="btn-delete" onClick={handleDelete}>
            削除
        </button>
        </div>
    </div>
  )
}