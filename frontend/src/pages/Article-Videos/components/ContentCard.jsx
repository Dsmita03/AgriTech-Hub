import { Button } from '@/components/ui/button';
import React from 'react'
import { FaVideo } from 'react-icons/fa';
import { useNavigate } from 'react-router'
const ContentCard = ({content,contentId}) => {
    const navigate = useNavigate();
  return (
    <div className="border p-6 rounded-lg hover:shadow-lg mb-4">
    {content.type === 'video' ? (
      <div className='flex items-center justify-between'>
       <h3 className="text-lg font-semibold">{content.title}</h3>
       <div className='flex items-center text-slate-900'>
            <FaVideo className="inline-block text-2xl" />
            <Button className="ml-2 bg-green-600" onClick={()=>navigate(`/articles-videos/content/${contentId}`)}>Watch Video</Button>
        </div>  

      </div>
    ) : (
      <div className='flex items-center justify-between'>
        <h3 className="text-lg font-semibold">{content.title}</h3>
        <Button className='ml-2 bg-green-600' onClick={()=>navigate(`/articles-videos/content/${contentId}`)}>Read Article</Button>
      </div>
    )}
  </div>
  )
}

export default ContentCard