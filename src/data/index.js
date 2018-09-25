

const videoA = {
  id: 'a',
  title: 'videoA',
  duration: 180,
  watched: false
}

const videoB = {
  id: 'b',
  title: 'videoB',
  duration: 240,
  watched: false
}

const videos = [videoA, videoB];

const getVideoById = (id) => new Promise((resolve) => {
  const [video] = videos.filter(video => {
    return video.id === id;
  })

  resolve(video)
})

const getVideos = () => new Promise((resolve) => resolve(videos))
const createVideo = ({title,duration,released}) => {
  const video = {
    id: (new Buffer(title, 'utf8')).toString('base64'),
    title,
    duration,
    released
  }
  videos.push(video);
  return video;
}

const getObjectById = (type, id) => {
  const types = {
    video: getVideoById
  };
  console.log(types);
  console.log(types[type](id));
  return types[type](id);
}

exports.getVideoById = getVideoById;
exports.getVideos = getVideos;
exports.createVideo = createVideo;
exports.getObjectById = getObjectById;