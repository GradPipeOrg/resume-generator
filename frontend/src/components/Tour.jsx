import Joyride, { STATUS } from 'react-joyride';

export const Tour = ({ run, setRun }) => {
  const steps = [
    {
      target: '#template-selector',
      content: 'Welcome! Start by selecting a resume template. We have different styles for different needs.',
      placement: 'bottom',
    },
    {
      target: '#personal-details',
      content: 'Fill in your personal details here. This information will appear in the header of your resume.',
      placement: 'bottom',
    },
    {
      target: '#add-experience-btn',
      content: 'Click this button to add a new entry to a section, like a new job or project.',
      placement: 'bottom',
    },
    {
      target: '#first-accomplishment-textarea',
      content: 'Describe your accomplishments here. Use the Markdown format **word** to make text bold!',
      placement: 'bottom',
    },
    {
      target: '#ai-tools-container',
      content: 'Use these powerful AI tools to polish your bullet points. The magic wand rewrites it, and the arrows adjust the length for a perfect fit.',
      placement: 'left',
    },
    {
      target: '#generate-pdf-btn',
      content: 'When you\'re ready, click here to generate a live preview of your PDF.',
      placement: 'top',
    },
    {
      target: '#pdf-preview',
      content: 'Your professional, pixel-perfect resume will appear here instantly. Click the download button to save it.',
      placement: 'left',
    },
  ];

  const handleJoyrideCallback = (data) => {
    const { status } = data;
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      setRun(false);
    }
  };

  return (
    <Joyride
      callback={handleJoyrideCallback}
      continuous
      run={run}
      scrollToFirstStep
      showProgress
      showSkipButton
      steps={steps}
      styles={{
        options: {
          arrowColor: '#1e293b',
          backgroundColor: '#1e293b',
          overlayColor: 'rgba(0, 0, 0, 0.8)',
          primaryColor: '#6366f1',
          textColor: '#f1f5f9',
          zIndex: 1000,
        },
      }}
    />
  );
};
