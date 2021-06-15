import _ from 'lodash'
import { UserInputError } from 'apollo-server'
import { prisma } from '../prisma'
import { QueryGroupsArgs, ReqContext, QueryGroupArgs, Group } from '../types'
import { initPagination } from '../helpers'

export class GroupResolver {
  private static groupQuery = async (root: unknown, args: QueryGroupArgs, ctx: ReqContext): Promise<Group | null> => {
    const { id } = args.where
    if (!id) throw new UserInputError('group_id is required')
    const group = await prisma.groups.findFirst({ where: { id } });
    return group;
  };

  private static groupsQuery = async (root: any, args: QueryGroupsArgs, ctx: ReqContext): Promise<Group[] | null> => {
    const { from, size } = initPagination(args.pagination)
    let groups = await prisma.groups.findMany({
      skip: from,
      take: size,
      include: {
        users: {
          include: { person: true }
        },
      },
    });
    groups = groups.map(group => {
      const people: any[] = []
      group.users.forEach(user => {
        if (user.person) people.push(user.person)
      });
      return { ...group, people };
    });
    return groups;
  }

  public static getResolver = () => {
    return {
      Query: {
        group: GroupResolver.groupQuery,
        groups: GroupResolver.groupsQuery,
      }
    }
  }

}