import React, { useState } from 'react';
import { ChevronRight, X, Home, List, Calendar, CheckSquare } from 'lucide-react';

interface TutorialProps {
  isOpen: boolean;
  onClose: () => void;
}

const Tutorial: React.FC<TutorialProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const tutorialSteps = [
    {
      icon: <Home size={32} />,
      title: 'Home',
      sections: [
        {
          number: '1',
          title: '学校検索',
          content: '学校を検索すると学校情報(通学経路、最寄駅等)を登録できます。'
        },
        {
          number: '2',
          title: '志望校一覧',
          content: '学校情報を登録した学校は一覧に表示されます。\n学校情報、志望校情報(志望度等)、受験情報(受験日時等)を登録できます。'
        },
        {
          number: '3',
          title: '受験一覧',
          content: '受験情報を登録した学校は一覧に表示されます。\n受験情報、受験管理(受験申込等のタスク)を登録できます。'
        }
      ]
    },
    {
      icon: <List size={32} />,
      title: '志望校情報一覧',
      sections: [
        {
          number: '4',
          content: '学校情報を登録した学校を一覧できます。'
        },
        {
          number: '5',
          content: '志望度などで並び替えができます。'
        }
      ]
    },
    {
      icon: <Calendar size={32} />,
      title: '受験情報一覧',
      sections: [
        {
          number: '6',
          content: '受験情報を登録した学校を一覧できます。'
        },
        {
          number: '7',
          content: '志望度などで並び替えができます。'
        }
      ]
    },
    {
      icon: <CheckSquare size={32} />,
      title: '受験管理',
      sections: [
        {
          number: '8',
          content: '受験情報ごとに受験申込などのタスクを登録できます。'
        },
        {
          number: '9',
          content: '登録したタスクの進捗を管理できます。'
        }
      ]
    }
  ];

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleClose = () => {
    setCurrentStep(0); // ステップをリセット
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  const currentTutorial = tutorialSteps[currentStep];

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        animation: 'fadeIn 0.2s ease-out'
      }}
      onClick={handleClose}
    >
      {/* チュートリアルカード */}
      <div 
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          padding: '1.5rem',
          maxWidth: '400px',
          width: '100%',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          position: 'relative',
          animation: 'slideInUp 0.3s ease-out'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 閉じるボタン */}
        <button
          onClick={handleClose}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <X size={24} color="#000000" />
        </button>

        {/* ヘッダー */}
        <div style={{
          textAlign: 'center',
          marginBottom: '1.5rem'
        }}>
          <h1 style={{
            fontSize: '1.75rem',
            fontWeight: '900',
            color: '#000000',
            margin: '0 0 0.5rem 0'
          }}>
            このアプリの使い方
          </h1>
        </div>

        {/* アイコンとタイトル */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          marginBottom: '1rem',
          paddingBottom: '1rem',
          borderBottom: '2px solid #e5e7eb'
        }}>
          <div style={{ color: '#000000' }}>
            {currentTutorial.icon}
          </div>
          <h2 style={{
            fontSize: '1.25rem',
            fontWeight: '700',
            color: '#000000',
            margin: 0
          }}>
            {currentTutorial.title}
          </h2>
        </div>

        {/* コンテンツ */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          marginBottom: '1.5rem'
        }}>
          {currentTutorial.sections.map((section, index) => (
            <div key={index} style={{
              display: 'flex',
              gap: '0.75rem'
            }}>
              <div style={{
                minWidth: '1.5rem',
                height: '1.5rem',
                backgroundColor: '#FFFFFF',
                color: '#000000',
                border: '2px solid #000000',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.875rem',
                fontWeight: '700',
                flexShrink: 0
              }}>
                {section.number}
              </div>
              <div style={{ flex: 1 }}>
                {section.title && (
                  <h3 style={{
                    fontSize: '1rem',
                    fontWeight: '700',
                    color: '#000000',
                    margin: '0 0 0.25rem 0'
                  }}>
                    {section.title}
                  </h3>
                )}
                <p style={{
                  fontSize: '0.875rem',
                  color: '#6A6A6A',
                  margin: 0,
                  lineHeight: '1.5',
                  whiteSpace: 'pre-line'
                }}>
                  {section.content}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* ページインジケーター */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '0.5rem',
          marginBottom: '1rem'
        }}>
          {tutorialSteps.map((_, index) => (
            <div
              key={index}
              style={{
                width: '0.5rem',
                height: '0.5rem',
                borderRadius: '50%',
                backgroundColor: index === currentStep ? '#000000' : '#e5e7eb',
                transition: 'background-color 0.3s ease'
              }}
            />
          ))}
        </div>

        {/* ナビゲーションボタン */}
        <div style={{
          display: 'flex',
          gap: '0.5rem'
        }}>
          <button
            onClick={handlePrev}
            disabled={currentStep === 0}
            style={{
              flex: 1,
              padding: '0.75rem',
              backgroundColor: currentStep === 0 ? '#e5e7eb' : '#828282',
              color: '#000000',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: '500',
              cursor: currentStep === 0 ? 'not-allowed' : 'pointer',
              opacity: currentStep === 0 ? 0.6 : 1,
              transition: 'all 0.2s ease'
            }}
          >
            前へ
          </button>
          <button
            onClick={handleNext}
            disabled={currentStep === tutorialSteps.length - 1}
            style={{
              flex: 1,
              padding: '0.75rem',
              backgroundColor: currentStep === tutorialSteps.length - 1 ? '#e5e7eb' : '#000000',
              color: currentStep === tutorialSteps.length - 1 ? '#000000' : '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: '500',
              cursor: currentStep === tutorialSteps.length - 1 ? 'not-allowed' : 'pointer',
              opacity: currentStep === tutorialSteps.length - 1 ? 0.6 : 1,
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
          >
            次へ
            {currentStep < tutorialSteps.length - 1 && <ChevronRight size={20} />}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideInUp {
          from { 
            opacity: 0;
            transform: translateY(20px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default Tutorial;