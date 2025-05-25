import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuiz } from '../../contexts/QuizContext';
import { useAuth } from '../../contexts/AuthContext';
import { Question, QuestionType } from '../../types';
import { 
  ArrowLeft, Plus, Trash, CheckCircle, Clock, FileQuestion
} from 'lucide-react';

const CreateQuiz: React.FC = () => {
  const { user } = useAuth();
  const { createQuiz } = useQuiz();
  const navigate = useNavigate();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [timeLimit, setTimeLimit] = useState(10);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isPublished, setIsPublished] = useState(false);
  
  const addQuestion = (type: QuestionType) => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      questionText: '',
      questionType: type,
      points: 5,
      ...(type === 'multiple-choice' 
        ? { options: ['', '', '', ''], correctAnswer: 0 }
        : type === 'true-false'
        ? { correctAnswer: true }
        : { correctAnswer: '' }),
    };
    
    setQuestions([...questions, newQuestion]);
  };
  
  const updateQuestion = (index: number, updates: Partial<Question>) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index] = { ...updatedQuestions[index], ...updates };
    setQuestions(updatedQuestions);
  };
  
  const updateMultipleChoiceOption = (questionIndex: number, optionIndex: number, value: string) => {
    const updatedQuestions = [...questions];
    const question = updatedQuestions[questionIndex] as any;
    
    if (question.options) {
      question.options[optionIndex] = value;
      setQuestions(updatedQuestions);
    }
  };
  
  const removeQuestion = (index: number) => {
    const updatedQuestions = [...questions];
    updatedQuestions.splice(index, 1);
    setQuestions(updatedQuestions);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    // Validate quiz
    if (!title.trim()) {
      alert('Please enter a quiz title');
      return;
    }
    
    if (questions.length === 0) {
      alert('Please add at least one question');
      return;
    }
    
    // Check each question for validity
    const invalidQuestions = questions.filter(q => {
      if (!q.questionText.trim()) return true;
      
      if (q.questionType === 'multiple-choice') {
        return (q as any).options.some((opt: string) => !opt.trim());
      }
      
      if (q.questionType === 'short-answer') {
        return !(q as any).correctAnswer.trim();
      }
      
      return false;
    });
    
    if (invalidQuestions.length > 0) {
      alert('Please fill in all question fields');
      return;
    }
    
    // Create the quiz
    createQuiz({
      title,
      description,
      teacherId: user.id,
      timeLimit,
      questions,
      isPublished,
    });
    
    navigate('/teacher');
  };
  
  return (
    <div>
      <div className="mb-6 flex items-center">
        <button
          onClick={() => navigate('/teacher')}
          className="mr-4 text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Create New Quiz</h1>
          <p className="text-gray-600">
            Add questions, set a time limit, and customize your quiz
          </p>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label 
                htmlFor="title" 
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Quiz Title
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="e.g., Introduction to Biology"
                required
              />
            </div>
            
            <div>
              <label 
                htmlFor="timeLimit" 
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Time Limit (minutes)
              </label>
              <input
                id="timeLimit"
                type="number"
                min="1"
                max="180"
                value={timeLimit}
                onChange={(e) => setTimeLimit(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
          </div>
          
          <div className="mb-6">
            <label 
              htmlFor="description" 
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Provide a brief description of the quiz"
              rows={3}
            />
          </div>
          
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <FileQuestion size={20} className="mr-2 text-indigo-600" />
              Questions
            </h2>
            
            {questions.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-md">
                <p className="text-gray-500 mb-4">
                  No questions yet. Use the buttons below to add questions.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {questions.map((question, index) => (
                  <div key={question.id} className="border border-gray-200 rounded-md p-4 bg-gray-50">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center">
                        <span className="bg-indigo-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium mr-2">
                          {index + 1}
                        </span>
                        <span className="text-sm font-medium text-gray-500">
                          {question.questionType === 'multiple-choice' 
                            ? 'Multiple Choice' 
                            : question.questionType === 'true-false'
                            ? 'True/False'
                            : 'Short Answer'}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeQuestion(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash size={18} />
                      </button>
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Question
                      </label>
                      <input
                        type="text"
                        value={question.questionText}
                        onChange={(e) => updateQuestion(index, { questionText: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Enter your question"
                        required
                      />
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Points
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={question.points}
                        onChange={(e) => updateQuestion(index, { points: Number(e.target.value) })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        required
                      />
                    </div>
                    
                    {question.questionType === 'multiple-choice' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Options
                        </label>
                        <div className="space-y-2">
                          {(question as any).options.map((option: string, optionIndex: number) => (
                            <div key={optionIndex} className="flex items-center">
                              <input
                                type="radio"
                                checked={(question as any).correctAnswer === optionIndex}
                                onChange={() => updateQuestion(index, { correctAnswer: optionIndex })}
                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 mr-2"
                              />
                              <input
                                type="text"
                                value={option}
                                onChange={(e) => updateMultipleChoiceOption(index, optionIndex, e.target.value)}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder={`Option ${optionIndex + 1}`}
                                required
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {question.questionType === 'true-false' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Correct Answer
                        </label>
                        <div className="flex space-x-4">
                          <label className="flex items-center">
                            <input
                              type="radio"
                              checked={(question as any).correctAnswer === true}
                              onChange={() => updateQuestion(index, { correctAnswer: true })}
                              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                            />
                            <span className="ml-2">True</span>
                          </label>
                          <label className="flex items-center">
                            <input
                              type="radio"
                              checked={(question as any).correctAnswer === false}
                              onChange={() => updateQuestion(index, { correctAnswer: false })}
                              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                            />
                            <span className="ml-2">False</span>
                          </label>
                        </div>
                      </div>
                    )}
                    
                    {question.questionType === 'short-answer' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Correct Answer
                        </label>
                        <input
                          type="text"
                          value={(question as any).correctAnswer}
                          onChange={(e) => updateQuestion(index, { correctAnswer: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="Enter the correct answer"
                          required
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => addQuestion('multiple-choice')}
                className="inline-flex items-center bg-indigo-100 text-indigo-700 px-4 py-2 rounded-md hover:bg-indigo-200 transition-colors"
              >
                <Plus size={18} className="mr-1" />
                Multiple Choice
              </button>
              <button
                type="button"
                onClick={() => addQuestion('true-false')}
                className="inline-flex items-center bg-indigo-100 text-indigo-700 px-4 py-2 rounded-md hover:bg-indigo-200 transition-colors"
              >
                <Plus size={18} className="mr-1" />
                True/False
              </button>
              <button
                type="button"
                onClick={() => addQuestion('short-answer')}
                className="inline-flex items-center bg-indigo-100 text-indigo-700 px-4 py-2 rounded-md hover:bg-indigo-200 transition-colors"
              >
                <Plus size={18} className="mr-1" />
                Short Answer
              </button>
            </div>
          </div>
          
          <div className="mb-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-gray-700">
                Publish quiz (make it available to students)
              </span>
            </label>
          </div>
          
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => navigate('/teacher')}
              className="bg-gray-100 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-200 transition-colors mr-4"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition-colors"
            >
              Create Quiz
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateQuiz;