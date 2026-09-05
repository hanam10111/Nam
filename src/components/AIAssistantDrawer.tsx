import React, { useState } from 'react';
import { Sparkles, X, Send, Bot, User, ArrowRight, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface AIAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSendQuery: (prompt: string) => Promise<{ answer: string; suggestedActions?: string[] }>;
}

export const AIAssistantDrawer: React.FC<AIAssistantDrawerProps> = ({
  isOpen,
  onClose,
  onSendQuery
}) => {
  const [messages, setMessages] = useState<Array<{ sender: 'ai' | 'user'; text: string; actions?: string[] }>>([
    {
      sender: 'ai',
      text: 'Xin chào! Tôi là **AccuTax AI Assistant** - Trợ lý Kế Toán Trưởng.\n\nTôi có thể trợ giúp bạn:\n- Tổng hợp công việc cần làm hôm nay & quá hạn.\n- Kiểm tra tình trạng thiếu chứng từ của các doanh nghiệp.\n- Phân tích rủi ro tờ khai & quy trình kê khai thuế GTGT, TNCN, TNDN.\n\nBạn cần tôi hỗ trợ thông tin gì?',
      actions: [
        'Hôm nay tôi cần làm những gì?',
        'Xem danh sách việc quá hạn?',
        'Công ty nào đang có nguy cơ rủi ro cao?',
        'Kiểm tra tình trạng thiếu chứng từ?'
      ]
    }
  ]);

  const [inputPrompt, setInputPrompt] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSend = async (promptToSend?: string) => {
    const text = promptToSend || inputPrompt;
    if (!text.trim() || loading) return;

    // Add user message
    setMessages(prev => [...prev, { sender: 'user', text }]);
    setInputPrompt('');
    setLoading(true);

    try {
      const res = await onSendQuery(text);
      setMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: res.answer,
          actions: res.suggestedActions
        }
      ]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: '⚠️ Không thể kết nối với AI Assistant. Vui lòng thử lại sau.'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white border-l border-slate-200 shadow-2xl z-50 flex flex-col animate-slide-left">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-purple-900 to-indigo-900 text-white flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-yellow-300">
            <Sparkles className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h3 className="font-bold text-xs">AccuTax AI Assistant</h3>
            <p className="text-[10px] text-purple-200">Trợ lý Kế Toán Trưởng Chuyên Nghiệp</p>
          </div>
        </div>

        <button onClick={onClose} className="text-purple-200 hover:text-white p-1">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-2.5 ${m.sender === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
              m.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-purple-100 text-purple-700'
            }`}>
              {m.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div className={`p-3 rounded-2xl max-w-[85%] space-y-2 ${
              m.sender === 'user'
                ? 'bg-blue-600 text-white rounded-tr-none'
                : 'bg-slate-100 text-slate-800 border border-slate-200/80 rounded-tl-none'
            }`}>
              <div className="whitespace-pre-line leading-relaxed">{m.text}</div>

              {/* Action Suggestion Pills */}
              {m.actions && m.actions.length > 0 && (
                <div className="pt-2 border-t border-slate-200/60 space-y-1">
                  <span className="text-[10px] text-slate-500 font-semibold block">Gợi ý câu hỏi:</span>
                  <div className="flex flex-col gap-1">
                    {m.actions.map((act, i) => (
                      <button
                        key={i}
                        onClick={() => handleSend(act)}
                        className="text-left text-[11px] bg-white hover:bg-purple-50 text-purple-700 font-medium px-2.5 py-1 rounded-lg border border-purple-200 flex items-center justify-between transition-colors"
                      >
                        <span>{act}</span>
                        <ArrowRight className="w-3 h-3 text-purple-400" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-purple-600 font-medium">
            <Bot className="w-4 h-4 animate-spin" />
            <span>AI Assistant đang phân tích dữ liệu hệ thống...</span>
          </div>
        )}
      </div>

      {/* Input Form */}
      <div className="p-3 bg-slate-50 border-t border-slate-200 shrink-0">
        <form
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="Hỏi AI về thuế, công việc, tiến độ..."
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            type="submit"
            disabled={loading || !inputPrompt.trim()}
            className="p-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-xl shadow-xs transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
