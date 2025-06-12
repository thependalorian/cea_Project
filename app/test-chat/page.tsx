'use client';

import { ClimateChat } from "@/components/chat/ClimateChat";

export default function TestChatPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">
          CopilotKit AG-UI Climate Chat Test
        </h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">
            7-Agent Climate Chat System
          </h2>
          <p className="text-gray-600 mb-6">
            This is a test page for the enhanced ClimateChat component with CopilotKit AG-UI integration.
          </p>
          
          {/* Modal Version for Testing */}
          <ClimateChat 
            variant="modal"
            defaultOpen={true}
            userContext={{
              userType: 'job_seeker',
              profile: {
                location: 'Massachusetts',
                goals: 'Climate career transition',
                background: 'Testing the chat system'
              },
              preferences: {
                career_focus: 'clean_energy',
                location_preference: 'massachusetts'
              }
            }}
          />
        </div>
      </div>
      
      {/* Sidebar Version for Testing */}
      <ClimateChat 
        variant="sidebar"
        defaultOpen={false}
        userContext={{
          userType: 'job_seeker',
          profile: {
            location: 'Massachusetts',
            goals: 'Climate career transition',
            background: 'Testing sidebar chat'
          },
          preferences: {
            career_focus: 'clean_energy',
            location_preference: 'massachusetts'
          }
        }}
      />
    </div>
  );
} 