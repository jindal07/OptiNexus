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
    { id: 'image-upscale', name: 'AI Upscale', icon: 'upscale', desc: 'Enhance image resolution (2x/4x)' },
    { id: 'image-resize', name: 'Resize Images', icon: 'resize', desc: 'Change image dimensions' },
    { id: 'image-convert', name: 'Convert Format', icon: 'convert', desc: 'Convert between formats' },
  ]
};

export default function App() {
  const [activeCategory, setActiveCategory] = useState('pdf');
  const [activeTool, setActiveTool] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [showJobs, setShowJobs] = useState(false);

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
    <div className="min-h-screen bg-surface-950 bg-mesh bg-grid relative">
      <Header 
        jobsCount={jobs.filter(j => j.status === 'processing').length} 
        onToggleJobs={() => setShowJobs(!showJobs)} 
      />
      
      <div className="flex">
        <Sidebar 
          activeCategory={activeCategory} 
          onCategoryChange={(cat) => {
            setActiveCategory(cat);
            setActiveTool(null);
          }}
        />
        
        <main className="flex-1 p-6 pt-20 ml-16 md:ml-20">
          <div className="max-w-7xl mx-auto">
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

