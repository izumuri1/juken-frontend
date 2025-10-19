// src/components/exam/ExamInfoForm.tsx
import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useForm } from '../../hooks/useForm'
import FormField from '../common/FormField'
import './ExamInfoForm.scss'

type TabType = 'difficulty' | 'application' | 'fee' | 'exam' | 'announcement' | 'enrollment' | 'admissionFee'

interface DifficultyFormData {
  deviationValue: string
  judgmentDate: string
  judgmentResult: string
}

interface ApplicationFormData {
  examCandidateSign: string
  applicationStart: string
  applicationEnd: string
  applicationDeadline: string
  applicationMethod: string
  applicationMaterials: string
  applicationNote: string
}

interface FeeFormData {
  feeDeadline: string
  feePaymentMethod: string
  feeAmount: string
  feeNote: string
}

interface ExamFormData {
  examStart: string
  examEnd: string
  examVenue: string
  examSubjects: string
  parentWaitingArea: string
  examNote: string
}

interface AnnouncementFormData {
  announcementTime: string
  announcementMethod: string
  announcementNote: string
}

interface EnrollmentFormData {
  enrollmentStart: string
  enrollmentEnd: string
  enrollmentMethod: string
  enrollmentNote: string
}

interface AdmissionFeeFormData {
  admissionFeeDeadline: string
  admissionFeePaymentMethod: string
  admissionFeeAmount: string
  admissionFeeNote: string
}

interface Props {
  workspaceId: string
  schoolId: string
  onExamInfoCreated: () => void
}

export default function ExamInfoForm({ workspaceId, schoolId, onExamInfoCreated }: Props) {
  const [activeTab, setActiveTab] = useState<TabType>('difficulty')
  const [error, setError] = useState<string | null>(null)

  // 難易度タブのフォーム
  const difficultyForm = useForm<DifficultyFormData>({
    initialValues: {
      deviationValue: '',
      judgmentDate: '',
      judgmentResult: ''
    },
    validationRules: {
      deviationValue: { required: true, displayName: '偏差値' }
    }
  })

  // 受験申込タブのフォーム
  const applicationForm = useForm<ApplicationFormData>({
    initialValues: {
      examCandidateSign: '',
      applicationStart: '',
      applicationEnd: '',
      applicationDeadline: '',
      applicationMethod: '',
      applicationMaterials: '',
      applicationNote: ''
    },
    validationRules: {}
  })

  // 受験料支払タブのフォーム
  const feeForm = useForm<FeeFormData>({
    initialValues: {
      feeDeadline: '',
      feePaymentMethod: '',
      feeAmount: '',
      feeNote: ''
    },
    validationRules: {}
  })

  // 受験タブのフォーム
  const examForm = useForm<ExamFormData>({
    initialValues: {
      examStart: '',
      examEnd: '',
      examVenue: '',
      examSubjects: '',
      parentWaitingArea: '',
      examNote: ''
    },
    validationRules: {
      examStart: { required: true, displayName: '受験開始時刻' },
      examEnd: { required: true, displayName: '受験終了時刻' },
      examVenue: { required: true, displayName: '受験会場' },
      examSubjects: { required: true, displayName: '受験科目' }
    }
  })

  // 合格発表タブのフォーム
  const announcementForm = useForm<AnnouncementFormData>({
    initialValues: {
      announcementTime: '',
      announcementMethod: '',
      announcementNote: ''
    },
    validationRules: {}
  })

  // 入学申込タブのフォーム
  const enrollmentForm = useForm<EnrollmentFormData>({
    initialValues: {
      enrollmentStart: '',
      enrollmentEnd: '',
      enrollmentMethod: '',
      enrollmentNote: ''
    },
    validationRules: {}
  })

  // 入学金支払タブのフォーム
  const admissionFeeForm = useForm<AdmissionFeeFormData>({
    initialValues: {
      admissionFeeDeadline: '',
      admissionFeePaymentMethod: '',
      admissionFeeAmount: '',
      admissionFeeNote: ''
    },
    validationRules: {}
  })

  const handleSubmit = async () => {
    // 必須フィールドのバリデーション
    if (!difficultyForm.validateAll() || !examForm.validateAll()) {
      setError('必須項目を入力してください')
      return
    }

    const allForms = [
      difficultyForm,
      applicationForm,
      feeForm,
      examForm,
      announcementForm,
      enrollmentForm,
      admissionFeeForm
    ]

    allForms.forEach(form => form.setSubmitting(true))
    setError(null)

    try {
      const { error: insertError } = await supabase
        .from('exam_info')
        .insert([{
          workspace_id: workspaceId,
          school_id: schoolId,
          // 難易度
          deviation_value: parseFloat(difficultyForm.values.deviationValue),
          judgment_date: difficultyForm.values.judgmentDate || null,
          judgment_result: difficultyForm.values.judgmentResult || null,
          // 受験申込
          exam_candidate_sign: applicationForm.values.examCandidateSign || null,
          application_start: applicationForm.values.applicationStart || null,
          application_end: applicationForm.values.applicationEnd || null,
          application_deadline: applicationForm.values.applicationDeadline || null,
          application_method: applicationForm.values.applicationMethod || null,
          application_materials: applicationForm.values.applicationMaterials || null,
          application_note: applicationForm.values.applicationNote || null,
          // 受験料支払
          fee_deadline: feeForm.values.feeDeadline || null,
          fee_payment_method: feeForm.values.feePaymentMethod || null,
          fee_amount: feeForm.values.feeAmount ? parseInt(feeForm.values.feeAmount) : null,
          fee_note: feeForm.values.feeNote || null,
          // 受験
          exam_start: examForm.values.examStart,
          exam_end: examForm.values.examEnd,
          exam_venue: examForm.values.examVenue,
          exam_subjects: examForm.values.examSubjects,
          parent_waiting_area: examForm.values.parentWaitingArea || null,
          exam_note: examForm.values.examNote || null,
          // 合格発表
          announcement_time: announcementForm.values.announcementTime || null,
          announcement_method: announcementForm.values.announcementMethod || null,
          announcement_note: announcementForm.values.announcementNote || null,
          // 入学申込
          enrollment_start: enrollmentForm.values.enrollmentStart || null,
          enrollment_end: enrollmentForm.values.enrollmentEnd || null,
          enrollment_method: enrollmentForm.values.enrollmentMethod || null,
          enrollment_note: enrollmentForm.values.enrollmentNote || null,
          // 入学金支払
          admission_fee_deadline: admissionFeeForm.values.admissionFeeDeadline || null,
          admission_fee_payment_method: admissionFeeForm.values.admissionFeePaymentMethod || null,
          admission_fee_amount: admissionFeeForm.values.admissionFeeAmount ? parseInt(admissionFeeForm.values.admissionFeeAmount) : null,
          admission_fee_note: admissionFeeForm.values.admissionFeeNote || null
        }])

      if (insertError) throw insertError

      // すべてのフォームをリセット
      allForms.forEach(form => form.reset())
      setActiveTab('difficulty')
      onExamInfoCreated()
    } catch (err) {
      console.error('Error creating exam info:', err)
      setError('受験情報の登録に失敗しました')
    } finally {
      allForms.forEach(form => form.setSubmitting(false))
    }
  }

  const isSubmitting = [
    difficultyForm,
    applicationForm,
    feeForm,
    examForm,
    announcementForm,
    enrollmentForm,
    admissionFeeForm
  ].some(form => form.isSubmitting)

  return (
    <section className="exam-info-form">
      <h2 className="section-title">受験情報入力</h2>

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
        {/* 難易度タブ */}
        {activeTab === 'difficulty' && (
          <div className="form-fields">
            <FormField
              type="number"
              label="偏差値"
              placeholder="例: 65.5"
              step="0.1"
              required
              {...difficultyForm.getFieldProps('deviationValue')}
            />
            <FormField
              type="date"
              label="合否判定日"
              {...difficultyForm.getFieldProps('judgmentDate')}
            />
            <FormField
              type="text"
              label="合否判定結果"
              placeholder="例: 合格、不合格"
              {...difficultyForm.getFieldProps('judgmentResult')}
            />
          </div>
        )}

        {/* 受験申込タブ */}
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
              {...applicationForm.getFieldProps('examCandidateSign')}
            />
            <FormField
              type="date"
              label="受験申込期間（開始）"
              {...applicationForm.getFieldProps('applicationStart')}
            />
            <FormField
              type="date"
              label="受験申込期間（終了）"
              {...applicationForm.getFieldProps('applicationEnd')}
            />
            <FormField
              type="datetime-local"
              label="受験申込期限"
              {...applicationForm.getFieldProps('applicationDeadline')}
            />
            <FormField
              type="textarea"
              label="受験申込方法"
              placeholder="例: WEB申込"
              rows={3}
              {...applicationForm.getFieldProps('applicationMethod')}
            />
            <FormField
              type="textarea"
              label="受験申込用資材"
              placeholder="例: 証明写真、受験票"
              rows={3}
              {...applicationForm.getFieldProps('applicationMaterials')}
            />
            <FormField
              type="textarea"
              label="備考"
              rows={3}
              {...applicationForm.getFieldProps('applicationNote')}
            />
          </div>
        )}

        {/* 受験料支払タブ */}
        {activeTab === 'fee' && (
          <div className="form-fields">
            <FormField
              type="datetime-local"
              label="受験料支払期限"
              {...feeForm.getFieldProps('feeDeadline')}
            />
            <FormField
              type="text"
              label="受験料支払方法"
              placeholder="例: クレジットカード、銀行振込"
              {...feeForm.getFieldProps('feePaymentMethod')}
            />
            <FormField
              type="number"
              label="受験料（円）"
              placeholder="例: 25000"
              {...feeForm.getFieldProps('feeAmount')}
            />
            <FormField
              type="textarea"
              label="備考"
              rows={3}
              {...feeForm.getFieldProps('feeNote')}
            />
          </div>
        )}

        {/* 受験タブ */}
        {activeTab === 'exam' && (
          <div className="form-fields">
            <FormField
              type="datetime-local"
              label="受験時間（開始）"
              required
              {...examForm.getFieldProps('examStart')}
            />
            <FormField
              type="datetime-local"
              label="受験時間（終了）"
              required
              {...examForm.getFieldProps('examEnd')}
            />
            <FormField
              type="text"
              label="受験会場"
              placeholder="例: 本校舎"
              required
              {...examForm.getFieldProps('examVenue')}
            />
            <FormField
              type="textarea"
              label="受験科目"
              placeholder="例: 国語、算数、理科、社会"
              rows={3}
              required
              {...examForm.getFieldProps('examSubjects')}
            />
            <FormField
              type="text"
              label="親の待機場所"
              placeholder="例: 体育館"
              {...examForm.getFieldProps('parentWaitingArea')}
            />
            <FormField
              type="textarea"
              label="備考"
              rows={3}
              {...examForm.getFieldProps('examNote')}
            />
          </div>
        )}

        {/* 合格発表タブ */}
        {activeTab === 'announcement' && (
          <div className="form-fields">
            <FormField
              type="datetime-local"
              label="発表時刻"
              {...announcementForm.getFieldProps('announcementTime')}
            />
            <FormField
              type="text"
              label="発表方法"
              placeholder="例: WEB発表、校内掲示"
              {...announcementForm.getFieldProps('announcementMethod')}
            />
            <FormField
              type="textarea"
              label="備考"
              rows={3}
              {...announcementForm.getFieldProps('announcementNote')}
            />
          </div>
        )}

        {/* 入学申込タブ */}
        {activeTab === 'enrollment' && (
          <div className="form-fields">
            <FormField
              type="datetime-local"
              label="入学申込期間（開始）"
              {...enrollmentForm.getFieldProps('enrollmentStart')}
            />
            <FormField
              type="datetime-local"
              label="入学申込期間（終了）"
              {...enrollmentForm.getFieldProps('enrollmentEnd')}
            />
            <FormField
              type="text"
              label="入学申込方法"
              placeholder="例: 窓口提出、郵送"
              {...enrollmentForm.getFieldProps('enrollmentMethod')}
            />
            <FormField
              type="textarea"
              label="備考"
              rows={3}
              {...enrollmentForm.getFieldProps('enrollmentNote')}
            />
          </div>
        )}

        {/* 入学金支払タブ */}
        {activeTab === 'admissionFee' && (
          <div className="form-fields">
            <FormField
              type="datetime-local"
              label="入学金支払期限"
              {...admissionFeeForm.getFieldProps('admissionFeeDeadline')}
            />
            <FormField
              type="text"
              label="入学金支払方法"
              placeholder="例: 銀行振込"
              {...admissionFeeForm.getFieldProps('admissionFeePaymentMethod')}
            />
            <FormField
              type="number"
              label="入学金（円）"
              placeholder="例: 300000"
              {...admissionFeeForm.getFieldProps('admissionFeeAmount')}
            />
            <FormField
              type="textarea"
              label="備考"
              rows={3}
              {...admissionFeeForm.getFieldProps('admissionFeeNote')}
            />
          </div>
        )}
      </div>

      <button
        className="btn-submit"
        onClick={handleSubmit}
        disabled={isSubmitting}
        >
        {isSubmitting ? '登録中...' : '受験情報登録'}
        </button>
    </section>
  )
}