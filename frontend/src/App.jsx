import { useState } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ToolWorkspace from './components/ToolWorkspace';
import JobsPanel from './components/JobsPanel';

const TOOLS = {
  pdf: [
    { id: 'merge', name: 'Merge PDFs', icon: 'merge', desc: 'Combine multiple PDFs into one', multiple: true },
    { id: 'split', name: 'Split PDF', icon: 'split', desc: 'Extract pages from PDF' },
    { id: 'compress', name: 'Compress PDF', icon: 'compress', desc: 'Reduce PDF file size' },
    { id: 'rotate', name: 'Rotate PDF', icon: 'rotate', desc: 'Rotate PDF pages' },
    { id: 'watermark', name: 'Add Watermark', icon: 'watermark', desc: 'Add text watermark' },
    { id: 'pdf-to-docx', name: 'PDF to DOCX', icon: 'convert', desc: 'Convert PDF to Word', requiresCloudConvert: true },
    { id: 'pdf-to-pptx', name: 'PDF to PPTX', icon: 'convert', desc: 'Convert PDF to PowerPoint', requiresCloudConvert: true },
    { id: 'docx-to-pdf', name: 'DOCX to PDF', icon: 'convert', desc: 'Convert Word to PDF', requiresCloudConvert: true, accept: '.doc,.docx' },
    { id: 'pptx-to-pdf', name: 'PPTX to PDF', icon: 'convert', desc: 'Convert PowerPoint to PDF', requiresCloudConvert: true, accept: '.ppt,.pptx' },
  ],
  image: [
    { id: 'image-compress', name: 'Compress Images', icon: 'compress', desc: 'Reduce image file size' },
    { id: 'image-upscale', name: 'AI Upscale', icon: 'upscale', desc: 'Enhance resolution (2x/4x)' },
    { id: 'image-resize', name: 'Resize Images', icon: 'resize', desc: 'Change dimensions' },
    { id: 'image-convert', name: 'Convert Format', icon: 'convert', desc: 'WebP, PNG, JPEG...' },
  ]
};

export default function App() {
  const [activeCategory, setActiveCategory] = useState('pdf');
  const [activeTool, setActiveTool] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [showJobs, setShowJobs] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSelectTool = (tool) => {
    setActiveTool(tool);
  };

  const handleBack = () => {
    setActiveTool(null);
  };

  const addJob = (job) => {
    setJobs(prev => [job, ...prev]);
    setShowJobs(true);
  };

  const updateJob = (jobId, updates) => {
    setJobs(prev => prev.map(j => 
      j.id === jobId ? { ...j, ...updates } : j
    ));
  };

  return (
    <div className="min-h-screen bg-surface-950 bg-mesh bg-noise relative overflow-x-hidden">
      {/* Ambient glow effects - Nature inspired */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-brand-500/8 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-accent-500/6 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed top-1/2 right-0 w-64 h-64 bg-slate-custom-500/5 rounded-full blur-[100px] pointer-events-none" />

      <Header 
        jobsCount={jobs.filter(j => j.status === 'processing' || j.status === 'uploading').length} 
        onToggleJobs={() => setShowJobs(!showJobs)} 
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        sidebarOpen={sidebarOpen}
        onLogoClick={() => setActiveTool(null)}
      />
      
      <div className="flex relative">
        <Sidebar 
          activeCategory={activeCategory} 
          onCategoryChange={(cat) => {
            setActiveCategory(cat);
            setActiveTool(null);
          }}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        
        <main className="flex-1 p-4 md:p-6 pt-20 md:pt-24 ml-0 md:ml-20 min-h-screen">
          <div className="max-w-6xl mx-auto">
            {activeTool ? (
              <ToolWorkspace 
                tool={activeTool} 
                onBack={handleBack}
                addJob={addJob}
                updateJob={updateJob}
              />
            ) : (
              <Dashboard 
                category={activeCategory}
                tools={TOOLS[activeCategory]}
                onSelectTool={handleSelectTool}
              />
            )}
          </div>
        </main>
      </div>

      <JobsPanel 
        jobs={jobs} 
        isOpen={showJobs} 
        onClose={() => setShowJobs(false)}
      />
    </div>
  );
}
