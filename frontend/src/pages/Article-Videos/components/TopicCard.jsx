import React from 'react'
import { useNavigate } from 'react-router';

const TopicCard = ({topic}) => {
    const navigate = useNavigate();
  return (
    <div onClick={()=>navigate(`/articles-videos/topic/${topic.id}`)} className="border p-4 rounded-lg hover:shadow-lg">
        <img src={topic.image} alt={topic.title} className="w-full h-40 object-cover mb-4 rounded-lg" />
        <h2 className="text-xl font-semibold">{topic.title}</h2>
        <p>{topic.description}</p>
      </div>
  )
}

export default TopicCard