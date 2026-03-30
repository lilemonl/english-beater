import React, { useState, useMemo } from 'react';
import { Card, Tag, Button, Input, Progress, Space, Segmented, Typography, Tooltip } from 'antd';
import { StarOutlined, StarFilled, HeartOutlined, HeartFilled, EditOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useGameStore } from '../store/gameStore';
import { mockWords } from '../data/mockData';

const { Text } = Typography;
const { TextArea } = Input;

export const Dictionary: React.FC = () => {
  const { setGameState, userData, toggleStar, toggleFavourite, setNote } = useGameStore();
  const [filter, setFilter] = useState<string>('All');
  const [expandedNotes, setExpandedNotes] = useState<Record<string, boolean>>({});

  const filteredWords = useMemo(() => {
    if (filter === 'Starred ⭐') return mockWords.filter(w => userData.starred.includes(w.id));
    if (filter === 'Favourited ❤️') return mockWords.filter(w => userData.favourites.includes(w.id));
    if (filter === 'All') return mockWords;
    return mockWords.filter(w => w.level === filter);
  }, [filter, userData]);

  // Calculate unique learned words (starred or favourited)
  const learnedCount = new Set([...userData.starred, ...userData.favourites]).size;
  const progressPercent = Math.round((learnedCount / mockWords.length) * 100);

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-800">Dictionary & Progress</h2>
          <Button type="primary" icon={<ArrowLeftOutlined />} onClick={() => setGameState('menu')} size="large" className="w-full md:w-auto">
            Back to Menu
          </Button>
        </div>

        {/* Progress Section */}
        <Card className="mb-6 shadow-sm">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold mb-1">Learning Progress</h3>
              <p className="text-slate-500 text-sm">Words you have starred or favourited</p>
            </div>
            <div className="w-full md:w-64">
              <Progress percent={progressPercent} status="active" strokeColor={{ '0%': '#108ee9', '100%': '#87d068' }} />
            </div>
          </div>
        </Card>

        {/* Filter Section */}
        <div className="mb-6 overflow-x-auto pb-2 scrollbar-hide">
          <Segmented 
            options={['All', 'CET-4', 'CET-6', 'IELTS', 'Starred ⭐', 'Favourited ❤️']} 
            value={filter} 
            onChange={(val) => setFilter(val as string)} 
            size="large"
          />
        </div>

        {/* Words Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredWords.map(w => {
            const isStarred = userData.starred.includes(w.id);
            const isFav = userData.favourites.includes(w.id);
            const note = userData.notes[w.id] || '';
            const isNoteExpanded = expandedNotes[w.id];

            return (
              <Card key={w.id} className="shadow-sm hover:shadow-md transition-shadow" bodyStyle={{ padding: '16px' }}>
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-slate-800">{w.word}</span>
                    <span className="text-slate-500 text-sm">{w.phonetic}</span>
                  </div>
                  <Space>
                    <Tooltip title="Star this word">
                      <Button type="text" shape="circle" 
                        icon={isStarred ? <StarFilled style={{color: '#faad14', fontSize: '18px'}}/> : <StarOutlined style={{fontSize: '18px'}}/>} 
                        onClick={() => toggleStar(w.id)} 
                      />
                    </Tooltip>
                    <Tooltip title="Favourite this word">
                      <Button type="text" shape="circle" 
                        icon={isFav ? <HeartFilled style={{color: '#ff4d4f', fontSize: '18px'}}/> : <HeartOutlined style={{fontSize: '18px'}}/>} 
                        onClick={() => toggleFavourite(w.id)} 
                      />
                    </Tooltip>
                  </Space>
                </div>
                
                <div className="mb-3">
                  <Tag color="blue">{w.level}</Tag>
                  <Text type="secondary" className="mr-2">{w.pos}</Text>
                  <Text strong>{w.translation}</Text>
                </div>

                {/* Notes Section */}
                <div className="border-t border-slate-100 pt-3 mt-2">
                  <Button 
                    type="dashed" 
                    size="small" 
                    icon={<EditOutlined />} 
                    onClick={() => setExpandedNotes(prev => ({...prev, [w.id]: !prev[w.id]}))}
                  >
                    {note ? 'Edit Note' : 'Add Note'}
                  </Button>
                  
                  {(isNoteExpanded || note) && (
                    <div className={`mt-3 transition-all ${!isNoteExpanded && note ? 'opacity-70' : ''}`}>
                      {isNoteExpanded ? (
                        <TextArea 
                          rows={2} 
                          value={note} 
                          onChange={(e) => setNote(w.id, e.target.value)} 
                          placeholder="Write your personal learning notes here..."
                          className="text-sm"
                        />
                      ) : (
                        <div className="bg-yellow-50 p-2 rounded text-sm text-slate-700 border border-yellow-100">
                          {note}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
          {filteredWords.length === 0 && (
            <div className="col-span-1 md:col-span-2 text-center py-12 text-slate-400">
              No words found in this category.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
