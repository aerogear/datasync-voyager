import { ObjectStateData } from './ObjectStateData'

/**
 * Provides ability to save previous versions of the data in order to provide
 * ability to know state of the data before both changes occurred.
 * giving ability to perform 2 way merge conflict resolution on server and client
 */
export interface StatePersistence {

  /**
   * Persist previous version of the object
   * @param previous - object data before update was performed
   */
  persist(previous: ObjectStateData): Promise<ObjectStateData>

  /**
   * Fetch base version for specified object.
   * Implementation allows users to fetch data before conflict happened
   */
  fetch(current: ObjectStateData): Promise<ObjectStateData>
}
