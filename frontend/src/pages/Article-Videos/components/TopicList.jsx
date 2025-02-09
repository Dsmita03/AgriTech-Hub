import React from 'react'
import { topics } from '../data/topics'
import TopicCard from './TopicCard'
const TopicList = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {topics.map((topic) => (
        <TopicCard key={topic.id} topic={topic} />
      ))}
    </div>
  )
}

export default TopicList