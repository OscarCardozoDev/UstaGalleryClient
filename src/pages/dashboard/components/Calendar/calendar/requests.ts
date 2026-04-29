import { createManualClass, updateClassTopic } from "../../../../../services/classes";

export const createClass = async (data: {
  groupId: string;
  date: string;
  startTime: string;
  endTime: string;
  topic?: string;
}) => {
  return createManualClass(data);
};

export const updateTopic = async (
  classId: string,
  data: { topic?: string; review?: string },
) => {
  return updateClassTopic(classId, data);
};
